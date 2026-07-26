import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { agentConfigCheck } from './agent-config-check';

function runner(exitCode: number, seen: CommandInvocation[]): CommandRunner {
  return {
    run: (invocation: CommandInvocation): Promise<CommandResult> => {
      seen.push(invocation);
      return Promise.resolve({ exitCode, stdout: '', stderr: '' });
    },
  };
}

describe('agentConfigCheck', () => {
  it('passes when devin accepts the compiled bundle', async () => {
    const seen: CommandInvocation[] = [];

    const check = await agentConfigCheck(runner(0, seen));

    expect(check.outcome).toBe('pass');
    expect(seen[0]?.args[0]).toBe('--agent-config');
  });

  it('fails when devin rejects the compiled bundle', async () => {
    expect((await agentConfigCheck(runner(1, []))).outcome).toBe('fail');
  });

  it('fails when devin cannot be run at all', async () => {
    const check = await agentConfigCheck({
      run: (): Promise<CommandResult> => Promise.reject(new Error('ENOENT')),
    });

    expect(check.outcome).toBe('fail');
  });
});
