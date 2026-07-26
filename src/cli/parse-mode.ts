import { UsageError } from '../run/usage-error';
import type { CliCommand } from './cli-command';
import { isFlag } from './is-flag';

export function parseMode(rest: readonly string[]): CliCommand {
  const usage: string = 'usage: omd mode <set|clear> [<mode>]';
  if (rest[0] === 'set') {
    const mode: string | undefined = rest[1];
    if (mode === undefined || isFlag(mode) || rest.length > 2) {
      throw new UsageError(usage);
    }
    return { kind: 'mode-set', mode };
  }
  if (rest[0] === 'clear' && rest.length === 1) {
    return { kind: 'mode-clear' };
  }
  throw new UsageError(usage);
}
