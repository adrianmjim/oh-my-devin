import type { KnowledgeEntry } from '../memory/knowledge-entry';
import { matchKnowledge } from '../memory/match-knowledge';
import type { NotepadEntry } from '../memory/notepad-entry';
import { readKnowledge } from '../memory/read-knowledge';
import { readNotepad } from '../memory/read-notepad';
import { selectPriorityEntries } from '../memory/select-priority-entries';
import type { AmbientMemory } from './ambient-memory';
import type { AmbientQuery } from './ambient-query';
import { pendingCandidates } from './pending-candidates';
import { pendingStagedRules } from './pending-staged-rules';
import { readStagedCandidates } from './read-staged-candidates';
import { readStagedRules } from './read-staged-rules';
import type { StagedCandidate } from './staged-candidate';
import type { StagedRule } from './staged-rule';

export async function composeAmbientMemory(
  baseDir: string,
  query: AmbientQuery,
  now: number,
): Promise<AmbientMemory> {
  const notepad: readonly NotepadEntry[] = await readNotepad(baseDir);
  const knowledge: readonly KnowledgeEntry[] = await readKnowledge(baseDir);
  const promptSubmission: boolean = query.phase === 'prompt-submission';
  const staged: readonly StagedCandidate[] = promptSubmission
    ? await readStagedCandidates(baseDir)
    : [];
  const rules: readonly StagedRule[] = promptSubmission
    ? await readStagedRules(baseDir)
    : [];
  return {
    priority: selectPriorityEntries(notepad),
    proposals: pendingCandidates(staged, query.sessionId, now),
    knowledge: matchKnowledge(knowledge, query.prompt),
    rules: pendingStagedRules(rules, query.sessionId, now),
  };
}
