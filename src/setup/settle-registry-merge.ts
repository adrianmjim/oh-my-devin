import { canonicalJson } from '../ownership/canonical-json';
import type { MergeOutcome } from '../ownership/merge-outcome';
import type { HookRegistryMerge } from './hook-registry-merge';
import { HOOKS_KEY } from './hooks-key';

export function settleRegistryMerge(
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
