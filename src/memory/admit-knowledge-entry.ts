import type { KnowledgeEntry } from './knowledge-entry';
import { MEMORY_CLASS_CAP } from './memory-class-cap';

export function admitKnowledgeEntry(
  entries: readonly KnowledgeEntry[],
  candidate: KnowledgeEntry,
): readonly KnowledgeEntry[] {
  const seen: Set<string> = new Set<string>();
  const collapsed: KnowledgeEntry[] = [];
  for (const entry of entries) {
    if (!seen.has(entry.hash)) {
      seen.add(entry.hash);
      collapsed.push(entry);
    }
  }
  const admitted: readonly KnowledgeEntry[] = seen.has(candidate.hash)
    ? collapsed
    : [...collapsed, candidate];
  const overflow: number = admitted.length - MEMORY_CLASS_CAP.knowledge;
  return overflow > 0 ? admitted.slice(overflow) : [...admitted];
}
