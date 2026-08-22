import { readFile } from 'node:fs/promises';
import { isKnowledgeEntry } from './is-knowledge-entry';
import type { KnowledgeEntry } from './knowledge-entry';
import { MemoryStorePaths } from './memory-store-paths';

export async function readKnowledge(
  baseDir: string,
): Promise<readonly KnowledgeEntry[]> {
  let raw: string;
  try {
    raw = await readFile(new MemoryStorePaths(baseDir).knowledge, 'utf8');
  } catch {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isKnowledgeEntry) : [];
}
