import type { KeywordPair } from './keyword-pair';

export interface PairingResult {
  readonly pairs: readonly KeywordPair[];
  readonly unmatchedCandidateIds: readonly string[];
  readonly unmatchedItemIds: readonly string[];
}
