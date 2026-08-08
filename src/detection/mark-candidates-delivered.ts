import type { StagedCandidate } from './staged-candidate';

export function markCandidatesDelivered(
  staged: readonly StagedCandidate[],
  principles: readonly string[],
  now: number,
): readonly StagedCandidate[] {
  return staged.map((candidate: StagedCandidate): StagedCandidate =>
    candidate.deliveredAt === null && principles.includes(candidate.principle)
      ? { ...candidate, deliveredAt: now }
      : candidate,
  );
}
