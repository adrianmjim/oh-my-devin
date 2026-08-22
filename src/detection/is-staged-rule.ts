import type { StagedRule } from './staged-rule';

export function isStagedRule(value: unknown): value is StagedRule {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<StagedRule> = value;
  return (
    typeof candidate.text === 'string' &&
    typeof candidate.hash === 'string' &&
    (candidate.sessionId === null || typeof candidate.sessionId === 'string') &&
    typeof candidate.stagedAt === 'number' &&
    typeof candidate.expiresAt === 'number' &&
    (candidate.deliveredAt === null ||
      typeof candidate.deliveredAt === 'number')
  );
}
