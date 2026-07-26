import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { headlessSurfaceCheck } from './headless-surface-check';

function runner(result: CommandResult | null): CommandRunner {
  return {
    run: (): Promise<CommandResult> =>
      result === null
        ? Promise.reject(new Error('ENOENT'))
        : Promise.resolve(result),
  };
}

describe('headlessSurfaceCheck', () => {
  it('passes when the listing has the expected shape', async () => {
    const check = await headlessSurfaceCheck(
      runner({
        exitCode: 0,
        stdout: '[{"id":"s-1","working_directory":"/w"}]',
        stderr: '',
      }),
    );

    expect(check.outcome).toBe('pass');
  });

  it('fails when the listing has an unexpected shape', async () => {
    expect(
      (
        await headlessSurfaceCheck(
          runner({ exitCode: 0, stdout: 'not json', stderr: '' }),
        )
      ).outcome,
    ).toBe('fail');
  });

  it('fails when the listing command did not run', async () => {
    expect((await headlessSurfaceCheck(runner(null))).outcome).toBe('fail');
  });

  it('asks devin for the json listing', async () => {
    const seen: CommandInvocation[] = [];

    await headlessSurfaceCheck({
      run: (invocation: CommandInvocation): Promise<CommandResult> => {
        seen.push(invocation);
        return Promise.resolve({ exitCode: 0, stdout: '[]', stderr: '' });
      },
    });

    expect(seen[0]?.args).toEqual(['list', '--format', 'json']);
  });
});
