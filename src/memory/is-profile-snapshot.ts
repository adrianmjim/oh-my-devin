import { isStringList } from './is-string-list';
import type { ProfileSnapshot } from './profile-snapshot';

export function isProfileSnapshot(value: unknown): value is ProfileSnapshot {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<ProfileSnapshot> = value;
  return (
    isStringList(candidate.stack) &&
    isStringList(candidate.layout) &&
    isStringList(candidate.entryCommands) &&
    typeof candidate.derivedAt === 'number'
  );
}
