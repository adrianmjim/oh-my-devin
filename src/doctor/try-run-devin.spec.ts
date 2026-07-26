import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { tryRunDevin } from './try-run-devin';

const RESULT: CommandResult = { exitCode: 0, stdout: 'out', stderr: '' };

describe('tryRunDevin', () => {
  it('runs devin with the arguments it is given', async () => {
    const seen: CommandInvocation[] = [];
    const runner: CommandRunner = {
      run: (invocation: CommandInvocation): Promise<CommandResult> => {
        seen.push(invocation);
        return Promise.resolve(RESULT);
      },
    };

    expect(await tryRunDevin(runner, ['--version'])).toBe(RESULT);
    expect(seen[0]).toEqual({ command: 'devin', args: ['--version'] });
  });

  it('is null when the command cannot be run at all', async () => {
    const runner: CommandRunner = {
      run: (): Promise<CommandResult> => Promise.reject(new Error('ENOENT')),
    };

    expect(await tryRunDevin(runner, ['--version'])).toBeNull();
  });
});
