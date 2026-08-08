import { AMBIENT_KNOWLEDGE_ENTRY_CAP } from './ambient-knowledge-entry-cap';
import type { KnowledgeEntry } from './knowledge-entry';
import { matchesTrigger } from './matches-trigger';

export function matchKnowledge(
  entries: readonly KnowledgeEntry[],
  text: string,
): readonly KnowledgeEntry[] {
  return entries
    .filter((entry: KnowledgeEntry): boolean =>
      entry.triggers.some((trigger: string): boolean =>
        matchesTrigger(text, trigger),
      ),
    )
    .slice(0, AMBIENT_KNOWLEDGE_ENTRY_CAP);
}
