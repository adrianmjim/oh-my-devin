import { isStringOrNull } from './is-string-or-null';
import type { RunClaim } from './run-claim';

export function isRunClaim(value: unknown): value is RunClaim {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<RunClaim> = value;
  return (
    typeof candidate.workingDirectory === 'string' &&
    typeof candidate.worktreeProvisioned === 'boolean' &&
    isStringOrNull(candidate.sessionId)
  );
}
