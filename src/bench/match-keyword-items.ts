import type { KeywordItem } from './keyword-item';
import { keywordMatchScore } from './keyword-match-score';
import type { PairingCandidate } from './pairing-candidate';

export function matchKeywordItems(
  candidates: readonly PairingCandidate[],
  items: readonly KeywordItem[],
  threshold: number,
): readonly string[] {
  return items
    .filter((item: KeywordItem): boolean =>
      candidates.some(
        (candidate: PairingCandidate): boolean =>
          keywordMatchScore(candidate.text, item.keywords) >= threshold,
      ),
    )
    .map((item: KeywordItem): string => item.id);
}
