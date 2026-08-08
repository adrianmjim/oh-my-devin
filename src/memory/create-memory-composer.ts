import type { KnowledgeEntry } from './knowledge-entry';
import { loadProjectProfile } from './load-project-profile';
import { matchKnowledge } from './match-knowledge';
import type { MemoryClass } from './memory-class';
import type { MemoryComposer } from './memory-composer';
import type { MemoryDelivery } from './memory-delivery';
import type { NotepadEntry } from './notepad-entry';
import type { ProfileSnapshot } from './profile-snapshot';
import { readKnowledge } from './read-knowledge';
import { readNotepad } from './read-notepad';

export function createMemoryComposer(
  baseDir: string,
  now: number,
): MemoryComposer {
  let heldProfile: Promise<ProfileSnapshot> | null = null;
  let heldNotepad: Promise<readonly NotepadEntry[]> | null = null;
  let heldKnowledge: Promise<readonly KnowledgeEntry[]> | null = null;
  return async (
    selection: readonly MemoryClass[],
    assignment: string,
  ): Promise<MemoryDelivery> => {
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
    let knowledge: readonly KnowledgeEntry[] = [];
    if (selection.includes('knowledge')) {
      heldKnowledge = heldKnowledge ?? readKnowledge(baseDir);
      knowledge = matchKnowledge(await heldKnowledge, assignment);
    }
    return { profile, notepad, knowledge };
  };
}
