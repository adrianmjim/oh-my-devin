import { UsageError } from '../run/usage-error';
import { HOOK_PHASES } from '../setup/hook-phases';
import type { HookCommand } from './hook-command';

export function parseHook(rest: readonly string[]): HookCommand {
  const phase: string | undefined = rest[0];
  if (phase === undefined || rest.length > 1 || !HOOK_PHASES.includes(phase)) {
    throw new UsageError(
      `usage: omd hook <${HOOK_PHASES.join('|')}> (reads the hook event on stdin)`,
    );
  }
  return { kind: 'hook', phase };
}
