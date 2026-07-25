import { canonicalJson } from '../ownership/canonical-json';
import type { MergeOutcome } from '../ownership/merge-outcome';
import { parseJsonObject } from '../ownership/parse-json-object';
import type { ClaimOutcome } from './claim-hook-events';
import { claimHookEvents } from './claim-hook-events';
import type { HooksEventMap } from './setup-templates';

export type HookRegistryShape = 'document' | 'config-key';

export interface HookRegistryMerge {
  readonly existing: string | null;
  readonly shape: HookRegistryShape;
  readonly hooksMap: HooksEventMap;
}

const HOOKS_KEY: string = 'hooks';

export const UNREADABLE_REGISTRY_REASON: string =
  'it is not a JSON object omd can read';
export const UNREADABLE_HOOKS_KEY_REASON: string =
  'its hooks key does not hold an event map omd can extend';

function eventsOf(
  shape: HookRegistryShape,
  document: Record<string, unknown>,
): Record<string, unknown> | null {
  const held: unknown = document[HOOKS_KEY];
  const holdsEventMap: boolean =
    typeof held === 'object' && held !== null && !Array.isArray(held);
  let events: Record<string, unknown> | null;
  if (shape === 'document') {
    events = document;
  } else if (held === undefined) {
    events = {};
  } else {
    events = holdsEventMap ? (held as Record<string, unknown>) : null;
  }
  return events;
}

function settle(
  input: HookRegistryMerge,
  document: Record<string, unknown>,
  claimed: Record<string, unknown>,
  absent: boolean,
): MergeOutcome {
  const merged: string = canonicalJson(
    input.shape === 'document'
      ? claimed
      : { ...document, [HOOKS_KEY]: claimed },
  );
  let outcome: MergeOutcome;
  if (absent) {
    outcome = { kind: 'created', content: merged };
  } else if (merged === input.existing) {
    outcome = { kind: 'unchanged' };
  } else {
    outcome = { kind: 'updated', content: merged };
  }
  return outcome;
}

function mergeDocument(
  input: HookRegistryMerge,
  document: Record<string, unknown>,
  absent: boolean,
): MergeOutcome {
  const events: Record<string, unknown> | null = eventsOf(
    input.shape,
    document,
  );
  let outcome: MergeOutcome;
  if (events === null) {
    outcome = { kind: 'blocked', reason: UNREADABLE_HOOKS_KEY_REASON };
  } else {
    const claim: ClaimOutcome = claimHookEvents(events, input.hooksMap);
    outcome =
      claim.kind === 'blocked'
        ? { kind: 'blocked', reason: claim.reason }
        : settle(input, document, claim.events, absent);
  }
  return outcome;
}

export function mergeHookRegistry(input: HookRegistryMerge): MergeOutcome {
  const existing: string | null = input.existing;
  const absent: boolean = existing === null || existing.trim() === '';
  const document: Record<string, unknown> | null = absent
    ? {}
    : parseJsonObject(existing ?? '');
  return document === null
    ? { kind: 'blocked', reason: UNREADABLE_REGISTRY_REASON }
    : mergeDocument(input, document, absent);
}
