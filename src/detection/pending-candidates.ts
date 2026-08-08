import { AMBIENT_PROPOSAL_CAP } from './ambient-proposal-cap';
import type { StagedCandidate } from './staged-candidate';

export function pendingCandidates(
  staged: readonly StagedCandidate[],
  now: number,
): readonly StagedCandidate[] {
  return staged
    .filter(
      (candidate: StagedCandidate): boolean =>
        candidate.deliveredAt === null && candidate.expiresAt > now,
    )
    .slice(0, AMBIENT_PROPOSAL_CAP);
}
