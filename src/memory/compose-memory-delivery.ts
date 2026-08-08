import { loadProjectProfile } from './load-project-profile';
import type { MemoryClass } from './memory-class';
import type { MemoryDelivery } from './memory-delivery';
import type { NotepadEntry } from './notepad-entry';
import type { ProfileSnapshot } from './profile-snapshot';
import { readNotepad } from './read-notepad';

export async function composeMemoryDelivery(
  baseDir: string,
  selection: readonly MemoryClass[],
  now: number,
): Promise<MemoryDelivery> {
  const profile: ProfileSnapshot | null = selection.includes('profile')
    ? await loadProjectProfile(baseDir, now)
    : null;
  const notepad: readonly NotepadEntry[] = selection.includes('notepad')
    ? await readNotepad(baseDir)
    : [];
  return { profile, notepad };
}
