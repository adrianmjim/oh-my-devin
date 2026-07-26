import { claimBlockedReason } from './claim-blocked-reason';
import { CLAIMED_EVENTS } from './claimed-events';
import type { ClaimOutcome } from './claim-outcome';
import type { HookMatcherEntry } from './hook-matcher-entry';
import type { HooksEventMap } from './hooks-event-map';
import { isOmdHookEntry } from './is-omd-hook-entry';
import { ownedCommandsOf } from './owned-commands-of';

export function claimHookEvents(
  existing: Record<string, unknown>,
  hooksMap: HooksEventMap,
  legacyCommands: readonly string[],
): ClaimOutcome {
  const owned: ReadonlySet<string> = ownedCommandsOf(hooksMap, legacyCommands);
  const events: Record<string, unknown> = { ...existing };
  let blocked: string | null = null;
  for (const event of CLAIMED_EVENTS) {
    const claimed: readonly HookMatcherEntry[] = hooksMap[event];
    const current: unknown = existing[event];
    if (current === undefined) {
      events[event] = [...claimed];
    } else if (Array.isArray(current)) {
      const foreign: readonly unknown[] = (
        current as readonly unknown[]
      ).filter((entry: unknown): boolean => !isOmdHookEntry(entry, owned));
      events[event] = [...foreign, ...claimed];
    } else {
      blocked ??= claimBlockedReason(event);
    }
  }
  return blocked === null
    ? { kind: 'claimed', events }
    : { kind: 'blocked', reason: blocked };
}
