import type { KnowledgeEntry } from '../memory/knowledge-entry';
import type { NotepadEntry } from '../memory/notepad-entry';
import type { StagedCandidate } from './staged-candidate';
import type { StagedRule } from './staged-rule';

export interface AmbientMemory {
  readonly priority: readonly NotepadEntry[];
  readonly proposals: readonly StagedCandidate[];
  readonly knowledge: readonly KnowledgeEntry[];
  readonly rules: readonly StagedRule[];
}
