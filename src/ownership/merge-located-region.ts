import { digestContent } from './digest-content';
import { EDITED_REASON } from './edited-reason';
import type { LocatedRegionMerge } from './located-region-merge';
import type { MergeOutcome } from './merge-outcome';

export function mergeLocatedRegion(input: LocatedRegionMerge): MergeOutcome {
  const pristine: boolean =
    digestContent(input.digestInput) === input.located.marker.digest;
  let outcome: MergeOutcome;
  if (!pristine) {
    outcome = { kind: 'preserved', reason: EDITED_REASON };
  } else if (input.merged === input.existing) {
    outcome = { kind: 'unchanged' };
  } else {
    outcome = { kind: 'updated', content: input.merged };
  }
  return outcome;
}
