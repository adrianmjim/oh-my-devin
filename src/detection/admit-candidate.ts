import type { StagedCandidate } from './staged-candidate';

export function admitCandidate(
  staged: readonly StagedCandidate[],
  candidate: StagedCandidate,
  now: number,
): readonly StagedCandidate[] {
  const live: readonly StagedCandidate[] = staged.filter(
    (held: StagedCandidate): boolean => held.expiresAt > now,
  );
  const known: boolean = live.some(
    (held: StagedCandidate): boolean =>
      held.principle === candidate.principle &&
      held.sessionId === candidate.sessionId,
  );
  return known ? [...live] : [...live, candidate];
}
