import { isOmdHookEntry } from './is-omd-hook-entry';
import type { HookMatcherEntry, HooksEventMap } from './setup-templates';

export interface EventsClaimed {
  readonly kind: 'claimed';
  readonly events: Record<string, unknown>;
}

export interface ClaimBlocked {
  readonly kind: 'blocked';
  readonly reason: string;
}

export type ClaimOutcome = EventsClaimed | ClaimBlocked;

const CLAIMED_EVENTS: readonly (keyof HooksEventMap)[] = [
  'SessionStart',
  'UserPromptSubmit',
  'Stop',
];

function blockedReason(event: string): string {
  return `its ${event} hooks are not a list omd can extend`;
}

export function claimHookEvents(
  existing: Record<string, unknown>,
  hooksMap: HooksEventMap,
): ClaimOutcome {
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
      ).filter((entry: unknown): boolean => !isOmdHookEntry(entry));
      events[event] = [...foreign, ...claimed];
    } else {
      blocked ??= blockedReason(event);
    }
  }
  return blocked === null
    ? { kind: 'claimed', events }
    : { kind: 'blocked', reason: blocked };
}
