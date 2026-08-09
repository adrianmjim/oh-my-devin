import type { DimensionScore } from './dimension-score';
import type { ExploreArtifact } from './explore-artifact';
import type { ExploreFinding } from './explore-finding';
import type { ExploreTruthDocument } from './explore-truth-document';
import type { ExploreTruthFile } from './explore-truth-file';
import { keywordMatchScore } from './keyword-match-score';
import { normalizeBenchText } from './normalize-bench-text';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';

export function scoreExplore(
  artifact: ExploreArtifact,
  truth: ExploreTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const pathMatches = (path: string, file: ExploreTruthFile): boolean =>
    normalizeBenchText(path).includes(normalizeBenchText(file.path).trimEnd());
  const recalls = (file: ExploreTruthFile): boolean =>
    artifact.findings.some(
      (finding: ExploreFinding): boolean =>
        pathMatches(finding.path, file) &&
        keywordMatchScore(finding.relevance, file.keywords) >= threshold,
    );
  const expected = (finding: ExploreFinding): boolean =>
    truth.files.some((file: ExploreTruthFile): boolean =>
      pathMatches(finding.path, file),
    );

  const recalled: number = truth.files.filter(recalls).length;
  const unexpected: number = artifact.findings.filter(
    (finding: ExploreFinding): boolean => !expected(finding),
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
    recall = artifact.findings.length === 0 ? 1 : 0;
  } else {
    recall = recalled / truth.files.length;
  }

  const claims: number = artifact.findings.length + links.length;
  const fabricated: number = unexpected + traced.unmatchedCandidateIds.length;

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
      score: claims === 0 ? 1 : 1 - fabricated / claims,
    },
  ];
}
