import type { DimensionScore } from './dimension-score';
import type { ReviewerArtifact } from './reviewer-artifact';
import type { ReviewerTruthDocument } from './reviewer-truth-document';
import { scoreReviewer } from './score-reviewer';
import type { SecurityReviewerTruthDocument } from './security-reviewer-truth-document';

export function scoreSecurityReviewer(
  artifact: ReviewerArtifact,
  truth: SecurityReviewerTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const asReview: ReviewerTruthDocument = {
    role: 'reviewer',
    expectedVerdict: truth.expectedVerdict,
    defects: truth.vulnerabilities,
  };
  return scoreReviewer(artifact, asReview, threshold);
}
