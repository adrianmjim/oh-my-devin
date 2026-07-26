import { UsageError } from '../run/usage-error';
import { formatLayerComponents } from '../setup/format-layer-components';
import { LEVEL_PREFIX } from './level-prefix';
import { SCOPE_PREFIX } from './scope-prefix';

export function assertKnownSetupArgs(rest: readonly string[]): void {
  for (const arg of rest) {
    if (!arg.startsWith(SCOPE_PREFIX) && !arg.startsWith(LEVEL_PREFIX)) {
      throw new UsageError(
        `usage: omd setup [--level=<project|user>] [--scope=${formatLayerComponents(',')}]`,
      );
    }
  }
}
