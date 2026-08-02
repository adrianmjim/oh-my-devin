import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HOOK_SCRIPT } from './hook-script';
import { SESSION_START_PHASE } from './session-start-phase';
import { STOP_PHASE } from './stop-phase';
import { USER_PROMPT_PHASE } from './user-prompt-phase';

const TODAYS_INJECTION: string = JSON.stringify({
  hookSpecificOutput: { additionalContext: 'Oh My Devin layer active.' },
});

const TODAYS_STOP_DECISION: string = JSON.stringify({
  decision: 'approve',
  hookSpecificOutput: { decision: 'approve' },
});

const GATE_LISTING: string = JSON.stringify({
  runs: [
    {
      runId: 'run-gate',
      runKind: 'pipeline',
      state: 'awaiting-gate',
      subject: 'feature-team',
      currentStage: 'architect',
      turnsUsed: 3,
      maxTurns: 8,
      pendingGate: 'architect',
      failureTier: null,
      lastEventAt: 2200,
      stateEnteredAt: 2200,
    },
  ],
});

describe('HOOK_SCRIPT', () => {
  it('is an executable node script', () => {
    expect(HOOK_SCRIPT.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('reads the persisted mode state', () => {
    expect(HOOK_SCRIPT).toContain('.omd/mode.json');
  });

  it('blocks a stop with unmet verification criteria', () => {
    expect(HOOK_SCRIPT).toContain('Unmet verification criteria for mode');
    expect(HOOK_SCRIPT).toContain("decision: 'block'");
  });

  it('injects the active mode context on the other phases', () => {
    expect(HOOK_SCRIPT).toContain('additionalContext');
    expect(HOOK_SCRIPT).toContain('Oh My Devin layer active.');
  });

  it('answers on stdout after stdin ends', () => {
    expect(HOOK_SCRIPT).toContain(
      'process.stdout.write(JSON.stringify(output))',
    );
  });

  describe('run as the deployed hook of a project', () => {
    let root: string;
    let projectDir: string;
    let binDir: string;
    let scriptPath: string;
    let argsPath: string;

    beforeEach(async () => {
      root = await mkdtemp(join(tmpdir(), 'omd-hook-script-'));
      projectDir = join(root, 'project');
      binDir = join(root, 'bin');
      scriptPath = join(root, 'omd-mode.mjs');
      argsPath = join(root, 'omd-args.txt');
      await mkdir(projectDir, { recursive: true });
      await mkdir(binDir, { recursive: true });
      await writeFile(scriptPath, HOOK_SCRIPT, 'utf8');
    });

    afterEach(async () => {
      await rm(root, { recursive: true, force: true });
    });

    async function installStubOmd(output: string): Promise<void> {
      const stubPath: string = join(binDir, 'omd');
      await writeFile(
        stubPath,
        [
          '#!/bin/sh',
          `printf '%s' "$*" > ${JSON.stringify(argsPath)}`,
          `printf '%s' '${output.replaceAll("'", `'\\''`)}'`,
          '',
        ].join('\n'),
        'utf8',
      );
      await chmod(stubPath, 0o755);
    }

    function runPhase(phase: string): Promise<string> {
      return new Promise<string>(
        (
          resolvePromise: (stdout: string) => void,
          reject: (error: Error) => void,
        ): void => {
          const child: ChildProcessWithoutNullStreams = spawn(
            process.execPath,
            [scriptPath, phase],
            { cwd: projectDir, env: { ...process.env, PATH: binDir } },
          );
          let stdout: string = '';
          child.stdout.on('data', (chunk: Buffer): void => {
            stdout += chunk.toString();
          });
          child.on('error', reject);
          child.on('close', (): void => {
            resolvePromise(stdout);
          });
          child.stdin.end();
        },
      );
    }

    it('appends an ambient run summary at session start', async () => {
      await installStubOmd(GATE_LISTING);

      const output: string = await runPhase(SESSION_START_PHASE);

      expect(output).toContain('Oh My Devin layer active.');
      expect(output).toContain('run-gate');
      expect(output).toContain('awaiting-gate');
      expect(output).toContain('architect');
      expect(output).toContain('2200');
    });

    it('appends an ambient run summary on each user prompt', async () => {
      await installStubOmd(GATE_LISTING);

      const output: string = await runPhase(USER_PROMPT_PHASE);

      expect(output).toContain('run-gate');
      expect(output).toContain('awaiting-gate');
    });

    it('obtains the summary from the public status listing surface', async () => {
      await installStubOmd(GATE_LISTING);

      await runPhase(SESSION_START_PHASE);

      expect(await readFile(argsPath, 'utf8')).toBe('status --json');
    });

    it('appends nothing when the project has no runs to report', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));

      expect(await runPhase(SESSION_START_PHASE)).toBe(TODAYS_INJECTION);
    });

    it('degrades silently when the status surface is absent', async () => {
      expect(await runPhase(SESSION_START_PHASE)).toBe(TODAYS_INJECTION);
    });

    it('degrades silently when the status surface emits garbage', async () => {
      await installStubOmd('not json at all');

      expect(await runPhase(SESSION_START_PHASE)).toBe(TODAYS_INJECTION);
    });

    it('degrades silently when the status listing has an unexpected shape', async () => {
      await installStubOmd(JSON.stringify({ unexpected: true }));

      expect(await runPhase(SESSION_START_PHASE)).toBe(TODAYS_INJECTION);
    });

    it('leaves the stop decision untouched and queries no status', async () => {
      await installStubOmd(GATE_LISTING);

      expect(await runPhase(STOP_PHASE)).toBe(TODAYS_STOP_DECISION);
      await expect(readFile(argsPath, 'utf8')).rejects.toThrow();
    });
  });
});
