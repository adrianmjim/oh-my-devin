import type { KnowledgeEntry } from './knowledge-entry';
import { MemoryStorePaths } from './memory-store-paths';
import { writeFileAtomically } from './write-file-atomically';

export async function writeKnowledge(
  baseDir: string,
  entries: readonly KnowledgeEntry[],
): Promise<void> {
  await writeFileAtomically(
    new MemoryStorePaths(baseDir).knowledge,
    `${JSON.stringify(entries, null, 2)}\n`,
  );
}
