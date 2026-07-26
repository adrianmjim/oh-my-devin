import type { MergeOutcome } from '../ownership/merge-outcome';

export function mergeOutcomeReason(outcome: MergeOutcome): string | null {
  let reason: string | null;
  if (
    outcome.kind === 'preserved' ||
    outcome.kind === 'conflicted' ||
    outcome.kind === 'blocked'
  ) {
    reason = outcome.reason;
  } else {
    reason = null;
  }
  return reason;
}
