import type { NotepadEntry } from './notepad-entry';
import type { ProfileSnapshot } from './profile-snapshot';

export interface MemoryDelivery {
  readonly profile: ProfileSnapshot | null;
  readonly notepad: readonly NotepadEntry[];
}
