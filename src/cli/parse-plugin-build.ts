import { UsageError } from '../run/usage-error';
import type { CliCommand } from './cli-command';
import { isFlag } from './is-flag';
import { OUT_PREFIX } from './out-prefix';

export function parsePluginBuild(rest: readonly string[]): CliCommand {
  const usage: string = 'usage: omd plugin build [--out <dir>]';
  if (rest[0] !== 'build') {
    throw new UsageError(usage);
  }
  let out: string | null = null;
  for (let index: number = 1; index < rest.length; index += 1) {
    const arg: string = rest[index] ?? '';
    if (arg === '--out') {
      const value: string | undefined = rest[index + 1];
      if (value === undefined || isFlag(value)) {
        throw new UsageError(usage);
      }
      out = value;
      index += 1;
    } else if (arg.startsWith(OUT_PREFIX)) {
      const value: string = arg.slice(OUT_PREFIX.length);
      if (value.length === 0) {
        throw new UsageError(usage);
      }
      out = value;
    } else {
      throw new UsageError(usage);
    }
  }
  return { kind: 'plugin-build', out };
}
