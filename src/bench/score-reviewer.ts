import type { DimensionScore } from './dimension-score';
import type { KeywordPair } from './keyword-pair';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';
import type { ReviewerArtifact } from './reviewer-artifact';
import type { ReviewerFinding } from './reviewer-finding';
import type { ReviewerSeverity } from './reviewer-severity';
import type { ReviewerTruthDocument } from './reviewer-truth-document';
import type { ReviewerTruthItem } from './reviewer-truth-item';

export function scoreReviewer(
  artifact: ReviewerArtifact,
  truth: ReviewerTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const candidates: readonly PairingCandidate[] = artifact.findings.map(
    (finding: ReviewerFinding, index: number): PairingCandidate => ({
      id: `finding-${index}`,
      text: `${finding.location} ${finding.summary} ${finding.fix}`,
    }),
  );
  const reported: ReadonlyMap<string, ReviewerSeverity> = new Map(
    artifact.findings.map(
      (finding: ReviewerFinding, index: number): [string, ReviewerSeverity] => [
        `finding-${index}`,
        finding.severity,
      ],
    ),
  );
  const expected: ReadonlyMap<string, ReviewerSeverity> = new Map(
    truth.defects.map(
      (defect: ReviewerTruthItem): [string, ReviewerSeverity] => [
        defect.id,
        defect.severity,
      ],
    ),
  );

  const result: PairingResult = pairTruthItems(
    candidates,
    truth.defects,
    threshold,
  );
  const severityMatches: number = result.pairs.filter(
    (pair: KeywordPair): boolean => {
      const filed: ReviewerSeverity | undefined = reported.get(pair.candidateId);
      return filed !== undefined && filed === expected.get(pair.itemId);
    },
  ).length;

  return [
    {
      dimension: 'detection',
      score:
        truth.defects.length === 0
          ? 1
          : result.pairs.length / truth.defects.length,
    },
    {
      dimension: 'false-positive-resistance',
      score:
        artifact.findings.length === 0
          ? 1
          : 1 - result.unmatchedCandidateIds.length / artifact.findings.length,
    },
    {
      dimension: 'severity-accuracy',
      score:
        truth.defects.length === 0
          ? 1
          : severityMatches / truth.defects.length,
    },
    {
      dimension: 'verdict-accuracy',
      score: artifact.verdict === truth.expectedVerdict ? 1 : 0,
    },
  ];
}
