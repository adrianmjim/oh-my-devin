import { readFile } from 'node:fs/promises';
import { isMissingFileError } from './is-missing-file-error';
import { isNotepadEntry } from './is-notepad-entry';
import { MemoryStoreError } from './memory-store-error';
import { MemoryStorePaths } from './memory-store-paths';
import type { NotepadEntry } from './notepad-entry';

export async function readNotepadForUpdate(
  baseDir: string,
): Promise<readonly NotepadEntry[]> {
  const path: string = new MemoryStorePaths(baseDir).notepad;
  let raw: string | null;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error: unknown) {
    if (!isMissingFileError(error)) {
      throw new MemoryStoreError(
        `memory notepad at ${path} cannot be read; refusing an update that could overwrite it`,
      );
    }
    raw = null;
  }
  let held: readonly NotepadEntry[];
  if (raw === null) {
    held = [];
  } else {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new MemoryStoreError(
        `memory notepad at ${path} holds unparseable content; refusing an update that would overwrite it`,
      );
    }
    if (!Array.isArray(parsed)) {
      throw new MemoryStoreError(
        `memory notepad at ${path} holds no entry list; refusing an update that would overwrite it`,
      );
    }
    const entries: readonly NotepadEntry[] = parsed.filter(isNotepadEntry);
    if (entries.length !== parsed.length) {
      throw new MemoryStoreError(
        `memory notepad at ${path} holds entries omd does not recognize; refusing an update that would overwrite them`,
      );
    }
    held = entries;
  }
  return held;
}
