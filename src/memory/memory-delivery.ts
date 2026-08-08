import type { KnowledgeEntry } from './knowledge-entry';
import type { NotepadEntry } from './notepad-entry';
import type { ProfileSnapshot } from './profile-snapshot';

export interface MemoryDelivery {
  readonly profile: ProfileSnapshot | null;
  readonly notepad: readonly NotepadEntry[];
  readonly knowledge: readonly KnowledgeEntry[];
}
