import { readFile } from 'node:fs/promises';
import { isNotepadEntry } from './is-notepad-entry';
import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';

export async function readNotepad(
  baseDir: string,
): Promise<readonly NotepadEntry[]> {
  let raw: string;
  try {
    raw = await readFile(new MemoryStorePaths(baseDir).notepad, 'utf8');
  } catch {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  return Array.isArray(parsed) ? parsed.filter(isNotepadEntry) : [];
}
