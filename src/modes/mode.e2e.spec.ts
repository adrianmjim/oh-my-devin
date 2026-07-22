import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

interface HookSpecificOutput {
  readonly additionalContext?: string;
  readonly decision?: string;
}

interface HookOutput {
  readonly decision?: string;
  readonly hookSpecificOutput: HookSpecificOutput;
}

interface ModeStateFile {
  readonly mode: string;
  readonly verification: readonly string[];
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function runHook(dir: string, phase: string): Promise<HookOutput> {
  return new Promise<HookOutput>(
    (
      resolve: (output: HookOutput) => void,
      reject: (error: Error) => void,
    ): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        process.execPath,
        [join(dir, '.devin', 'hooks', 'omd-mode.mjs'), phase],
        { cwd: dir },
      );
      let stdout: string = '';
      child.stdout.on('data', (chunk: Buffer): void => {
        stdout += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (): void => {
        resolve(JSON.parse(stdout) as HookOutput);
      });
      child.stdin.write('{}');
      child.stdin.end();
    },
  );
}

describe('omd mode (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('persists the active mode state and clears it', async () => {
    project = await createE2eProject();
    const statePath: string = join(project.dir, '.omd', 'mode.json');

    const set: CommandResult = await project.run(['mode', 'set', 'team']);
    expect(set.exitCode).toBe(0);
    expect(set.stdout).toContain('mode set: team');
    expect(await exists(statePath)).toBe(true);
    const state: ModeStateFile = JSON.parse(
      await readFile(statePath, 'utf8'),
    ) as ModeStateFile;
    expect(state.mode).toBe('team');
    expect(state.verification.length).toBeGreaterThan(0);

    const clear: CommandResult = await project.run(['mode', 'clear']);
    expect(clear.exitCode).toBe(0);
    expect(clear.stdout).toContain('mode cleared');
    expect(await exists(statePath)).toBe(false);
  });

  it('injects mode context through the installed hook and releases it on clear', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    await project.run(['mode', 'set', 'team']);
    const injected: HookOutput = await runHook(project.dir, 'user-prompt');
    expect(injected.hookSpecificOutput.additionalContext).toContain(
      'Active mode: team',
    );

    await project.run(['mode', 'clear']);
    const released: HookOutput = await runHook(project.dir, 'user-prompt');
    expect(released.hookSpecificOutput.additionalContext).toBe(
      'Oh My Devin layer active.',
    );
  });

  it('blocks the stop hook while a mode with unmet criteria is active', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    await project.run(['mode', 'set', 'team']);
    const blocked: HookOutput = await runHook(project.dir, 'stop');
    expect(blocked.decision).toBe('block');

    await project.run(['mode', 'clear']);
    const approved: HookOutput = await runHook(project.dir, 'stop');
    expect(approved.decision).toBe('approve');
  });
});
