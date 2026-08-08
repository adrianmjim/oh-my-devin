import { UsageError } from '../run/usage-error';
import type { CliCommand } from './cli-command';
import { isFlag } from './is-flag';

export function parseMemory(rest: readonly string[]): CliCommand {
  const usage: string = 'usage: omd memory remember "<text>"';
  if (rest[0] !== 'remember') {
    throw new UsageError(usage);
  }
  const text: string | undefined = rest[1];
  if (
    text === undefined ||
    isFlag(text) ||
    text.trim() === '' ||
    rest.length > 2
  ) {
    throw new UsageError(usage);
  }
  return { kind: 'memory-remember', text };
}
