import type { ArchitectArtifact } from './architect-artifact';
import type { ArchitectTruthDocument } from './architect-truth-document';
import type { DimensionScore } from './dimension-score';
import { matchKeywordItems } from './match-keyword-items';
import type { PairingCandidate } from './pairing-candidate';
import { planCandidates } from './plan-candidates';

export function scoreArchitect(
  artifact: ArchitectArtifact,
  truth: ArchitectTruthDocument,
  threshold: number,
): readonly DimensionScore[] {
  const candidates: readonly PairingCandidate[] = planCandidates(artifact);
  const covered: readonly string[] = matchKeywordItems(
    candidates,
    truth.gaps,
    threshold,
  );
  const taken: readonly string[] = matchKeywordItems(
    candidates,
    truth.spurious,
    threshold,
  );

  return [
    {
      dimension: 'gap-coverage',
      score: truth.gaps.length === 0 ? 1 : covered.length / truth.gaps.length,
    },
    {
      dimension: 'spurious-step-resistance',
      score:
        truth.spurious.length === 0
          ? 1
          : 1 - taken.length / truth.spurious.length,
    },
  ];
}
