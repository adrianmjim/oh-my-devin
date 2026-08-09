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
import { DIRECTIVE_MARKERS } from '../detection/directive-markers';
import { QUALITY_GATE_THRESHOLD } from '../detection/quality-gate-threshold';
import { HOOK_PHASES } from './hook-phases';
import { HOOK_SCRIPT } from './hook-script';
import { SESSION_START_PHASE } from './session-start-phase';
import { STOP_PHASE } from './stop-phase';
import { TOOL_USE_PHASE } from './tool-use-phase';
import { USER_PROMPT_PHASE } from './user-prompt-phase';

const FALLBACK_INJECTION: string = JSON.stringify({
  hookSpecificOutput: { additionalContext: 'Oh My Devin layer active.' },
});

const FALLBACK_STOP: string = JSON.stringify({
  decision: 'approve',
  hookSpecificOutput: { decision: 'approve' },
});

const EVENT: string = JSON.stringify({
  session_id: 'sess-1',
  tool_input: { command: 'omd mode set plan' },
});

describe('HOOK_SCRIPT', () => {
  it('is an executable node script', () => {
    expect(HOOK_SCRIPT.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('pipes every phase to the binary', () => {
    expect(HOOK_SCRIPT).toContain("execFileSync('omd', ['hook', phase]");
  });

  it('carries no state layout of its own', () => {
    expect(HOOK_SCRIPT).not.toContain('.omd/');
    expect(HOOK_SCRIPT).not.toContain('mode.json');
    expect(HOOK_SCRIPT).not.toContain('notepad');
  });

  it('carries no session matching or staleness judgment of its own', () => {
    expect(HOOK_SCRIPT).not.toContain('session_id');
    expect(HOOK_SCRIPT).not.toContain('stale');
    expect(HOOK_SCRIPT).not.toContain('verification');
  });

  it('answers on stdout after stdin ends', () => {
    expect(HOOK_SCRIPT).toContain('process.stdout.write(JSON.stringify(');
  });

  it('carries no detection pattern, gate, trigger, or glob of its own', () => {
    for (const marker of DIRECTIVE_MARKERS) {
      expect(HOOK_SCRIPT).not.toContain(marker.phrase);
    }
    expect(HOOK_SCRIPT).not.toContain(String(QUALITY_GATE_THRESHOLD));
    expect(HOOK_SCRIPT).not.toContain('trigger');
    expect(HOOK_SCRIPT).not.toContain('glob');
    expect(HOOK_SCRIPT).not.toContain('**');
    expect(HOOK_SCRIPT).not.toContain('knowledge');
    expect(HOOK_SCRIPT).not.toContain('candidate');
    expect(HOOK_SCRIPT).not.toContain('principle');
  });

  describe('run as the deployed hook of a project', () => {
    let root: string;
    let projectDir: string;
    let binDir: string;
    let scriptPath: string;
    let argsPath: string;
    let stdinPath: string;

    beforeEach(async () => {
      root = await mkdtemp(join(tmpdir(), 'omd-hook-script-'));
      projectDir = join(root, 'project');
      binDir = join(root, 'bin');
      scriptPath = join(root, 'omd-mode.mjs');
      argsPath = join(root, 'omd-args.txt');
      stdinPath = join(root, 'omd-stdin.txt');
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
          '{',
          '  while IFS= read -r line || [ -n "$line" ]; do',
          '    printf \'%s\' "$line"',
          '  done',
          `} > ${JSON.stringify(stdinPath)}`,
          `printf '%s' '${output.replaceAll("'", `'\\''`)}'`,
          '',
        ].join('\n'),
        'utf8',
      );
      await chmod(stubPath, 0o755);
    }

    function runPhase(phase: string, payload: string): Promise<string> {
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
          child.stdin.end(payload);
        },
      );
    }

    it('invokes the binary once per phase with that phase', async () => {
      await installStubOmd('{}');

      for (const phase of HOOK_PHASES) {
        await runPhase(phase, EVENT);

        expect(await readFile(argsPath, 'utf8')).toBe(`hook ${phase}`);
      }
    });

    it('pipes the hook event through to the binary', async () => {
      await installStubOmd('{}');

      await runPhase(USER_PROMPT_PHASE, EVENT);

      expect(await readFile(stdinPath, 'utf8')).toBe(EVENT);
    });

    it('pipes the prompt detection reads through untouched', async () => {
      await installStubOmd('{}');
      const submitted: string = JSON.stringify({
        session_id: 'sess-1',
        prompt: 'always run the migration check before deploying',
      });

      await runPhase(USER_PROMPT_PHASE, submitted);

      expect(await readFile(stdinPath, 'utf8')).toBe(submitted);
    });

    it('pipes the touched path rule staging reads through untouched', async () => {
      await installStubOmd('{}');
      const touched: string = JSON.stringify({
        session_id: 'sess-1',
        tool_input: { file_path: 'src/api/export-endpoint.ts' },
      });

      await runPhase(TOOL_USE_PHASE, touched);

      expect(await readFile(stdinPath, 'utf8')).toBe(touched);
    });

    it('echoes the injection the binary composed', async () => {
      const answer: string = JSON.stringify({
        hookSpecificOutput: { additionalContext: 'Active mode: plan.' },
      });
      await installStubOmd(answer);

      expect(await runPhase(SESSION_START_PHASE, EVENT)).toBe(answer);
    });

    it('echoes the stop decision the binary derived', async () => {
      const answer: string = JSON.stringify({
        decision: 'block',
        reason: 'run r-1 is running',
        hookSpecificOutput: {
          decision: 'block',
          reason: 'run r-1 is running',
        },
      });
      await installStubOmd(answer);

      expect(await runPhase(STOP_PHASE, EVENT)).toBe(answer);
    });

    it('answers the tool-use phase without a decision', async () => {
      await installStubOmd('{}');

      expect(await runPhase(TOOL_USE_PHASE, EVENT)).toBe('{}');
    });

    it('injects nothing on tool-use when the binary is absent', async () => {
      expect(await runPhase(TOOL_USE_PHASE, EVENT)).toBe('{}');
    });

    it('degrades to the layer announcement when the binary is absent', async () => {
      expect(await runPhase(USER_PROMPT_PHASE, EVENT)).toBe(FALLBACK_INJECTION);
    });

    it('degrades to an approval on stop when the binary is absent', async () => {
      expect(await runPhase(STOP_PHASE, EVENT)).toBe(FALLBACK_STOP);
    });

    it('degrades when the binary answers something that is not JSON', async () => {
      await installStubOmd('not json at all');

      expect(await runPhase(SESSION_START_PHASE, EVENT)).toBe(
        FALLBACK_INJECTION,
      );
    });

    it('degrades when the binary answers a JSON scalar', async () => {
      await installStubOmd('42');

      expect(await runPhase(STOP_PHASE, EVENT)).toBe(FALLBACK_STOP);
    });
  });
});
