import { isStringList } from './is-string-list';
import type { KnowledgeEntry } from './knowledge-entry';

export function isKnowledgeEntry(value: unknown): value is KnowledgeEntry {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<KnowledgeEntry> = value;
  return (
    typeof candidate.text === 'string' &&
    isStringList(candidate.triggers) &&
    typeof candidate.hash === 'string' &&
    typeof candidate.recordedAt === 'number'
  );
}
