import type { KeywordItem } from './keyword-item';
import { keywordMatchScore } from './keyword-match-score';
import type { KeywordPair } from './keyword-pair';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingOption } from './pairing-option';
import type { PairingResult } from './pairing-result';

export function pairTruthItems(
  candidates: readonly PairingCandidate[],
  items: readonly KeywordItem[],
  threshold: number,
): PairingResult {
  const options: PairingOption[] = [];
  items.forEach((item: KeywordItem, itemIndex: number): void => {
    candidates.forEach(
      (candidate: PairingCandidate, candidateIndex: number): void => {
        const score: number = keywordMatchScore(candidate.text, item.keywords);
        if (score >= threshold) {
          options.push({ item, candidate, itemIndex, candidateIndex, score });
        }
      },
    );
  });
  options.sort(
    (left: PairingOption, right: PairingOption): number =>
      right.score - left.score ||
      left.itemIndex - right.itemIndex ||
      left.candidateIndex - right.candidateIndex,
  );

  const pairedItems: Set<string> = new Set<string>();
  const pairedCandidates: Set<string> = new Set<string>();
  const pairs: KeywordPair[] = [];
  for (const option of options) {
    const free: boolean =
      !pairedItems.has(option.item.id) &&
      !pairedCandidates.has(option.candidate.id);
    if (free) {
      pairedItems.add(option.item.id);
      pairedCandidates.add(option.candidate.id);
      pairs.push({
        candidateId: option.candidate.id,
        itemId: option.item.id,
        score: option.score,
      });
    }
  }

  return {
    pairs,
    unmatchedCandidateIds: candidates
      .filter(
        (candidate: PairingCandidate): boolean =>
          !pairedCandidates.has(candidate.id),
      )
      .map((candidate: PairingCandidate): string => candidate.id),
    unmatchedItemIds: items
      .filter((item: KeywordItem): boolean => !pairedItems.has(item.id))
      .map((item: KeywordItem): string => item.id),
  };
}
