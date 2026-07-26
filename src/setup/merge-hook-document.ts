import type { MergeOutcome } from '../ownership/merge-outcome';
import { claimHookEvents } from './claim-hook-events';
import type { ClaimOutcome } from './claim-outcome';
import { hookRegistryEvents } from './hook-registry-events';
import type { HookRegistryMerge } from './hook-registry-merge';
import { settleRegistryMerge } from './settle-registry-merge';
import { UNREADABLE_HOOKS_KEY_REASON } from './unreadable-hooks-key-reason';

export function mergeHookDocument(
  input: HookRegistryMerge,
  document: Record<string, unknown>,
  absent: boolean,
): MergeOutcome {
  const events: Record<string, unknown> | null = hookRegistryEvents(
    input.shape,
    document,
  );
  let outcome: MergeOutcome;
  if (events === null) {
    outcome = { kind: 'blocked', reason: UNREADABLE_HOOKS_KEY_REASON };
  } else {
    const claim: ClaimOutcome = claimHookEvents(
      events,
      input.hooksMap,
      input.legacyCommands,
    );
    outcome =
      claim.kind === 'blocked'
        ? { kind: 'blocked', reason: claim.reason }
        : settleRegistryMerge(input, document, claim.events, absent);
  }
  return outcome;
}
