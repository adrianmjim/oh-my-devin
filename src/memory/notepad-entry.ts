import type { NotepadEntryKind } from './notepad-entry-kind';

export interface NotepadEntry {
  readonly kind: NotepadEntryKind;
  readonly text: string;
  readonly hash: string;
  readonly recordedAt: number;
}
