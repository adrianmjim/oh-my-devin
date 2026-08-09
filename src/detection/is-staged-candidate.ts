import type { StagedCandidate } from './staged-candidate';

export function isStagedCandidate(value: unknown): value is StagedCandidate {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<StagedCandidate> = value;
  return (
    typeof candidate.principle === 'string' &&
    typeof candidate.confirmingCommand === 'string' &&
    typeof candidate.score === 'number' &&
    (candidate.sessionId === null || typeof candidate.sessionId === 'string') &&
    typeof candidate.expiresAt === 'number' &&
    (candidate.deliveredAt === null ||
      typeof candidate.deliveredAt === 'number')
  );
}
