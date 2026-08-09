import type { StagedIdentity } from './staged-identity';

export function isStagedIdentity(value: unknown): value is StagedIdentity {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<StagedIdentity> = value;
  return (
    typeof candidate.sessionId === 'string' &&
    typeof candidate.invocation === 'string' &&
    typeof candidate.stagedAt === 'number'
  );
}
