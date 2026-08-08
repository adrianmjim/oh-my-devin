import type { KeywordItem } from './keyword-item';
import { keywordMatchScore } from './keyword-match-score';
import type { KeywordPair } from './keyword-pair';
import { maximumPairing } from './maximum-pairing';
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

  const chosen: readonly PairingOption[] = maximumPairing(options);
  const pairedItems: ReadonlySet<string> = new Set<string>(
    chosen.map((option: PairingOption): string => option.item.id),
  );
  const pairedCandidates: ReadonlySet<string> = new Set<string>(
    chosen.map((option: PairingOption): string => option.candidate.id),
  );

  return {
    pairs: chosen.map(
      (option: PairingOption): KeywordPair => ({
        candidateId: option.candidate.id,
        itemId: option.item.id,
        score: option.score,
      }),
    ),
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
