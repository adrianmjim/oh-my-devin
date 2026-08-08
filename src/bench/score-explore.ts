import type { DimensionScore } from './dimension-score';
import type { ExploreArtifact } from './explore-artifact';
import type { ExploreTruthDocument } from './explore-truth-document';
import type { ExploreTruthFile } from './explore-truth-file';
import { normalizeBenchText } from './normalize-bench-text';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';

export function scoreExplore(
  artifact: ExploreArtifact,
  truth: ExploreTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const recalls = (file: ExploreTruthFile): boolean =>
    artifact.paths.some((path: string): boolean =>
      normalizeBenchText(path).includes(normalizeBenchText(file.path).trimEnd()),
    );
  const expected = (path: string): boolean =>
    truth.files.some((file: ExploreTruthFile): boolean =>
      normalizeBenchText(path).includes(normalizeBenchText(file.path).trimEnd()),
    );

  const recalled: number = truth.files.filter(recalls).length;
  const unexpected: number = artifact.paths.filter(
    (path: string): boolean => !expected(path),
  ).length;

  const links: readonly PairingCandidate[] = artifact.relationships.map(
    (text: string, index: number): PairingCandidate => ({
      id: `relationship-${index}`,
      text,
    }),
  );
  const traced: PairingResult = pairTruthItems(
    links,
    truth.relationships,
    threshold,
  );

  let recall: number;
  if (truth.files.length === 0) {
    recall = artifact.paths.length === 0 ? 1 : 0;
  } else {
    recall = recalled / truth.files.length;
  }

  return [
    { dimension: 'file-recall', score: recall },
    {
      dimension: 'relationship-coverage',
      score:
        truth.relationships.length === 0
          ? 1
          : traced.pairs.length / truth.relationships.length,
    },
    {
      dimension: 'false-positive-resistance',
      score:
        artifact.paths.length === 0
          ? 1
          : 1 - unexpected / artifact.paths.length,
    },
  ];
}
