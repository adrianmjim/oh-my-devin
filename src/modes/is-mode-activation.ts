import type { ModeActivation } from './mode-activation';

export function isModeActivation(value: unknown): value is ModeActivation {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<ModeActivation> = value;
  return (
    typeof candidate.mode === 'string' &&
    typeof candidate.sessionId === 'string' &&
    typeof candidate.activatedAt === 'number' &&
    (candidate.correlatedRunId === null ||
      typeof candidate.correlatedRunId === 'string')
  );
}
