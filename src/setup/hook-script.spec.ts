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
import { AMBIENT_PRIORITY_ENTRY_CAP } from '../memory/ambient-priority-entry-cap';
import { MemoryStorePaths } from '../memory/memory-store-paths';
import type { NotepadEntry } from '../memory/notepad-entry';
import type { NotepadEntryKind } from '../memory/notepad-entry-kind';
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

    async function writeNotepad(
      entries: readonly NotepadEntry[],
    ): Promise<void> {
      const paths: MemoryStorePaths = new MemoryStorePaths(projectDir);
      await mkdir(paths.dir, { recursive: true });
      await writeFile(paths.notepad, JSON.stringify(entries), 'utf8');
    }

    function note(text: string, kind: NotepadEntryKind): NotepadEntry {
      return { kind, text, hash: text, recordedAt: 1 };
    }

    it('injects the priority notes at session start', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));
      await writeNotepad([note('deploys need the staging gate', 'priority')]);

      const output: string = await runPhase(SESSION_START_PHASE);

      expect(output).toContain('deploys need the staging gate');
    });

    it('injects the priority notes on each user prompt', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));
      await writeNotepad([note('deploys need the staging gate', 'priority')]);

      const output: string = await runPhase(USER_PROMPT_PHASE);

      expect(output).toContain('deploys need the staging gate');
    });

    it('injects only the priority notes, never the working or manual ones', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));
      await writeNotepad([
        note('deploys need the staging gate', 'priority'),
        note('mid-task scratch', 'working'),
        note('a manual aside', 'manual'),
      ]);

      const output: string = await runPhase(SESSION_START_PHASE);

      expect(output).toContain('deploys need the staging gate');
      expect(output).not.toContain('mid-task scratch');
      expect(output).not.toContain('a manual aside');
    });

    it('bounds how many priority notes it injects', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));
      await writeNotepad(
        Array.from(
          { length: AMBIENT_PRIORITY_ENTRY_CAP + 4 },
          (_unused: unknown, index: number): NotepadEntry =>
            note(`priority note ${index}`, 'priority'),
        ),
      );

      const output: string = await runPhase(SESSION_START_PHASE);

      expect(output.match(/priority note /g) ?? []).toHaveLength(
        AMBIENT_PRIORITY_ENTRY_CAP,
      );
    });

    it('injects no profile content ambiently', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));
      await writeNotepad([note('deploys need the staging gate', 'priority')]);
      await writeFile(
        new MemoryStorePaths(projectDir).profile,
        JSON.stringify({
          stack: ['unmistakable-stack-marker'],
          layout: [],
          entryCommands: [],
          derivedAt: 1,
        }),
        'utf8',
      );

      const output: string = await runPhase(SESSION_START_PHASE);

      expect(output).not.toContain('unmistakable-stack-marker');
    });

    it('injects nothing when the notepad holds no priority note', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));
      await writeNotepad([note('mid-task scratch', 'working')]);

      expect(await runPhase(SESSION_START_PHASE)).toBe(TODAYS_INJECTION);
    });

    it('degrades silently when the memory store cannot be read', async () => {
      await installStubOmd(JSON.stringify({ runs: [] }));
      const paths: MemoryStorePaths = new MemoryStorePaths(projectDir);
      await mkdir(paths.dir, { recursive: true });
      await writeFile(paths.notepad, 'not json at all', 'utf8');

      expect(await runPhase(SESSION_START_PHASE)).toBe(TODAYS_INJECTION);
    });

    it('leaves the stop decision free of memory content', async () => {
      await installStubOmd(GATE_LISTING);
      await writeNotepad([note('deploys need the staging gate', 'priority')]);

      expect(await runPhase(STOP_PHASE)).toBe(TODAYS_STOP_DECISION);
    });

    it('leaves the stop decision untouched and queries no status', async () => {
      await installStubOmd(GATE_LISTING);

      expect(await runPhase(STOP_PHASE)).toBe(TODAYS_STOP_DECISION);
      await expect(readFile(argsPath, 'utf8')).rejects.toThrow();
    });
  });
});
