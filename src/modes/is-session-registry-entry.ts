import type { SessionRegistryEntry } from './session-registry-entry';

export function isSessionRegistryEntry(
  value: unknown,
): value is SessionRegistryEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<SessionRegistryEntry> = value;
  return (
    typeof candidate.sessionId === 'string' &&
    typeof candidate.lastSeenAt === 'number'
  );
}
