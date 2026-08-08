import type { KnowledgeEntry } from '../memory/knowledge-entry';
import { matchKnowledge } from '../memory/match-knowledge';
import type { NotepadEntry } from '../memory/notepad-entry';
import { readKnowledge } from '../memory/read-knowledge';
import { readNotepad } from '../memory/read-notepad';
import { selectPriorityEntries } from '../memory/select-priority-entries';
import type { AmbientMemory } from './ambient-memory';
import { pendingCandidates } from './pending-candidates';
import { pendingStagedRules } from './pending-staged-rules';
import { readStagedCandidates } from './read-staged-candidates';
import { readStagedRules } from './read-staged-rules';
import type { StagedCandidate } from './staged-candidate';
import type { StagedRule } from './staged-rule';

export async function composeAmbientMemory(
  baseDir: string,
  prompt: string,
  now: number,
): Promise<AmbientMemory> {
  const notepad: readonly NotepadEntry[] = await readNotepad(baseDir);
  const knowledge: readonly KnowledgeEntry[] = await readKnowledge(baseDir);
  const staged: readonly StagedCandidate[] =
    await readStagedCandidates(baseDir);
  const rules: readonly StagedRule[] = await readStagedRules(baseDir);
  return {
    priority: selectPriorityEntries(notepad),
    proposals: pendingCandidates(staged, now),
    knowledge: matchKnowledge(knowledge, prompt),
    rules: pendingStagedRules(rules),
  };
}
