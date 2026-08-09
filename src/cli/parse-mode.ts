import type { RunId } from '../observability/run-id';
import { UsageError } from '../run/usage-error';
import type { CliCommand } from './cli-command';
import { isFlag } from './is-flag';

export function parseMode(rest: readonly string[]): CliCommand {
  const usage: string = 'usage: omd mode <set|clear> [<mode>] [--run <run-id>]';
  const invocation: string = ['mode', ...rest].join(' ');
  const mode: string | undefined = rest[1];
  let command: CliCommand;
  if (rest[0] === 'set') {
    const runId: RunId | undefined = rest[3];
    const bare: boolean = rest.length === 2;
    const correlated: boolean =
      rest.length === 4 &&
      rest[2] === '--run' &&
      runId !== undefined &&
      !isFlag(runId);
    if (mode === undefined || isFlag(mode) || (!bare && !correlated)) {
      throw new UsageError(usage);
    }
    command = { kind: 'mode-set', mode, runId: runId ?? null, invocation };
  } else if (rest[0] === 'clear') {
    if (rest.length > 2 || (mode !== undefined && isFlag(mode))) {
      throw new UsageError(usage);
    }
    command = { kind: 'mode-clear', mode: mode ?? null, invocation };
  } else {
    throw new UsageError(usage);
  }
  return command;
}
