import type { RunId } from '../observability/run-id';
import { UsageError } from '../run/usage-error';
import type { CliCommand } from './cli-command';
import { isFlag } from './is-flag';

export function parseMode(rest: readonly string[]): CliCommand {
  const usage: string = 'usage: omd mode <set|clear> [<mode>] [--run <run-id>]';
  const invocation: string = ['mode', ...rest].join(' ');
  const positionals: readonly string[] = rest.filter(
    (argument: string): boolean => !isFlag(argument),
  );
  const runAt: number = rest.indexOf('--run');
  const flagged: readonly string[] = rest.filter(isFlag);
  if (flagged.some((flag: string): boolean => flag !== '--run')) {
    throw new UsageError(usage);
  }
  let command: CliCommand;
  if (rest[0] === 'set') {
    const mode: string | undefined = positionals[1];
    const runId: RunId | undefined = runAt === -1 ? undefined : rest[runAt + 1];
    if (
      mode === undefined ||
      positionals.length > (runAt === -1 ? 2 : 3) ||
      (runAt !== -1 && (runId === undefined || isFlag(runId)))
    ) {
      throw new UsageError(usage);
    }
    command = {
      kind: 'mode-set',
      mode,
      runId: runId ?? null,
      invocation,
    };
  } else if (rest[0] === 'clear') {
    if (runAt !== -1 || positionals.length > 2) {
      throw new UsageError(usage);
    }
    command = { kind: 'mode-clear', mode: positionals[1] ?? null, invocation };
  } else {
    throw new UsageError(usage);
  }
  return command;
}
