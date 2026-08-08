import type { AnalystArtifact } from './analyst-artifact';
import type { AnalystSurface } from './analyst-surface';
import type { AnalystTruthDocument } from './analyst-truth-document';
import type { AnalystTruthItem } from './analyst-truth-item';
import type { DimensionScore } from './dimension-score';
import type { KeywordPair } from './keyword-pair';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';

export function scoreAnalyst(
  artifact: AnalystArtifact,
  truth: AnalystTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const entries: readonly PairingCandidate[] = [
    ...artifact.criteria.map(
      (text: string, index: number): PairingCandidate => ({
        id: `criterion-${index}`,
        text,
      }),
    ),
    ...artifact.questions.map(
      (text: string, index: number): PairingCandidate => ({
        id: `question-${index}`,
        text,
      }),
    ),
    ...artifact.assumptions.map(
      (text: string, index: number): PairingCandidate => ({
        id: `assumption-${index}`,
        text,
      }),
    ),
  ];

  const padding: readonly PairingCandidate[] = entries.filter(
    (entry: PairingCandidate): boolean => !entry.id.startsWith('criterion-'),
  );
  const anywhere: PairingResult = pairTruthItems(
    entries,
    truth.gaps,
    threshold,
  );
  const inPlace: readonly KeywordPair[] = anywhere.pairs.filter(
    (pair: KeywordPair): boolean => {
      const gap: AnalystTruthItem | undefined = truth.gaps.find(
        (item: AnalystTruthItem): boolean => item.id === pair.itemId,
      );
      const surface: AnalystSurface | undefined = gap?.surface;
      return surface !== undefined && pair.candidateId.startsWith(`${surface}-`);
    },
  );

  return [
    {
      dimension: 'detection',
      score:
        truth.gaps.length === 0
          ? 1
          : anywhere.pairs.length / truth.gaps.length,
    },
    {
      dimension: 'gap-coverage',
      score:
        truth.gaps.length === 0 ? 1 : inPlace.length / truth.gaps.length,
    },
    {
      dimension: 'false-positive-resistance',
      score:
        padding.length === 0
          ? 1
          : 1 -
            padding.filter((entry: PairingCandidate): boolean =>
              anywhere.unmatchedCandidateIds.includes(entry.id),
            ).length /
              padding.length,
    },
  ];
}
