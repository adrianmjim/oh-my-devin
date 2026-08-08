import { isStringList } from './is-string-list';
import type { RuleEntry } from './rule-entry';

export function isRuleEntry(value: unknown): value is RuleEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<RuleEntry> = value;
  return (
    typeof candidate.text === 'string' &&
    isStringList(candidate.globs) &&
    typeof candidate.hash === 'string' &&
    typeof candidate.recordedAt === 'number'
  );
}
