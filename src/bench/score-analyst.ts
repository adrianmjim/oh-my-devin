import type { AnalystArtifact } from './analyst-artifact';
import type { AnalystSurface } from './analyst-surface';
import type { AnalystTruthDocument } from './analyst-truth-document';
import type { AnalystTruthItem } from './analyst-truth-item';
import type { DimensionScore } from './dimension-score';
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
    ...artifact.risks.map(
      (text: string, index: number): PairingCandidate => ({
        id: `risk-${index}`,
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
  const surfaces: readonly AnalystSurface[] = [
    ...new Set<AnalystSurface>(
      truth.gaps.map((gap: AnalystTruthItem): AnalystSurface => gap.surface),
    ),
  ];
  const covered: number = surfaces.reduce(
    (sum: number, surface: AnalystSurface): number =>
      sum +
      pairTruthItems(
        entries.filter((entry: PairingCandidate): boolean =>
          entry.id.startsWith(`${surface}-`),
        ),
        truth.gaps.filter(
          (gap: AnalystTruthItem): boolean => gap.surface === surface,
        ),
        threshold,
      ).pairs.length,
    0,
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
      score: truth.gaps.length === 0 ? 1 : covered / truth.gaps.length,
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
