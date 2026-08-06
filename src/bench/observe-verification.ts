import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import type { ExecutorTestsClaim } from './executor-tests-claim';
import type { ExecutorVerification } from './executor-verification';

export async function observeVerification(
  verification: ExecutorVerification,
  runner: CommandRunner,
): Promise<ExecutorTestsClaim> {
  const result: CommandResult = await runner.run({
    command: verification.command,
    args: verification.args,
  });
  return result.exitCode === 0 ? 'passed' : 'failed';
}
