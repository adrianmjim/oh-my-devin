import { digestContent } from './digest-content';
import type { MergeOutcome } from './merge-outcome';
import { EDITED_REASON } from './merge-outcome';
import type { RegionLocated } from './region-scan';

export interface LocatedRegionMerge {
  readonly existing: string;
  readonly located: RegionLocated;
  readonly digestInput: string;
  readonly merged: string;
}

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
