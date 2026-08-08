import { loadProjectProfile } from './load-project-profile';
import type { MemoryClass } from './memory-class';
import type { MemoryComposer } from './memory-composer';
import type { MemoryDelivery } from './memory-delivery';
import type { NotepadEntry } from './notepad-entry';
import type { ProfileSnapshot } from './profile-snapshot';
import { readNotepad } from './read-notepad';

export function createMemoryComposer(
  baseDir: string,
  now: number,
): MemoryComposer {
  let heldProfile: Promise<ProfileSnapshot> | null = null;
  let heldNotepad: Promise<readonly NotepadEntry[]> | null = null;
  return async (selection: readonly MemoryClass[]): Promise<MemoryDelivery> => {
    let profile: ProfileSnapshot | null = null;
    if (selection.includes('profile')) {
      heldProfile = heldProfile ?? loadProjectProfile(baseDir, now);
      profile = await heldProfile;
    }
    let notepad: readonly NotepadEntry[] = [];
    if (selection.includes('notepad')) {
      heldNotepad = heldNotepad ?? readNotepad(baseDir);
      notepad = await heldNotepad;
    }
    return { profile, notepad };
  };
}
