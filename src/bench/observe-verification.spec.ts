import { describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { ExecutorVerification } from './executor-verification';
import { observeVerification } from './observe-verification';

const VERIFICATION: ExecutorVerification = {
  command: 'node',
  args: ['--test'],
};

class ExitCodeRunner implements CommandRunner {
  public readonly invocations: CommandInvocation[] = [];

  public constructor(private readonly exitCode: number | null) {}

  public run(invocation: CommandInvocation): Promise<CommandResult> {
    this.invocations.push(invocation);
    return Promise.resolve({ stdout: '', stderr: '', exitCode: this.exitCode });
  }
}

describe('observeVerification', () => {
  it('observes a passing verification from a zero exit code', async () => {
    const runner: ExitCodeRunner = new ExitCodeRunner(0);

    await expect(observeVerification(VERIFICATION, runner)).resolves.toBe(
      'passed',
    );
  });

  it('observes a failing verification from a non-zero exit code', async () => {
    const runner: ExitCodeRunner = new ExitCodeRunner(1);

    await expect(observeVerification(VERIFICATION, runner)).resolves.toBe(
      'failed',
    );
  });

  it('observes a signal-terminated verification as failed', async () => {
    const runner: ExitCodeRunner = new ExitCodeRunner(null);

    await expect(observeVerification(VERIFICATION, runner)).resolves.toBe(
      'failed',
    );
  });

  it('runs exactly the truth-declared verification command', async () => {
    const runner: ExitCodeRunner = new ExitCodeRunner(0);

    await observeVerification(VERIFICATION, runner);

    expect(runner.invocations).toEqual([{ command: 'node', args: ['--test'] }]);
  });
});
