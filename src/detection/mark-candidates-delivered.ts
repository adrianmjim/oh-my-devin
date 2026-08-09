import type { StagedCandidate } from './staged-candidate';

export function markCandidatesDelivered(
  staged: readonly StagedCandidate[],
  delivered: readonly StagedCandidate[],
  now: number,
): readonly StagedCandidate[] {
  return staged.map((candidate: StagedCandidate): StagedCandidate =>
    candidate.deliveredAt === null &&
    delivered.some(
      (entry: StagedCandidate): boolean =>
        entry.principle === candidate.principle &&
        entry.sessionId === candidate.sessionId,
    )
      ? { ...candidate, deliveredAt: now }
      : candidate,
  );
}
