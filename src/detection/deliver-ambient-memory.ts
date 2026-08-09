import type { AmbientMemory } from './ambient-memory';
import type { AmbientQuery } from './ambient-query';
import { composeAmbientMemory } from './compose-ambient-memory';
import { markCandidatesDelivered } from './mark-candidates-delivered';
import { markRulesDelivered } from './mark-rules-delivered';
import { readStagedCandidates } from './read-staged-candidates';
import { readStagedRules } from './read-staged-rules';
import { renderAmbientMemory } from './render-ambient-memory';
import type { StagedCandidate } from './staged-candidate';
import type { StagedRule } from './staged-rule';
import { writeStagedCandidates } from './write-staged-candidates';
import { writeStagedRules } from './write-staged-rules';

export async function deliverAmbientMemory(
  baseDir: string,
  query: AmbientQuery,
  now: number,
): Promise<string> {
  const ambient: AmbientMemory = await composeAmbientMemory(
    baseDir,
    query,
    now,
  );
  if (ambient.proposals.length > 0) {
    const staged: readonly StagedCandidate[] =
      await readStagedCandidates(baseDir);
    await writeStagedCandidates(
      baseDir,
      markCandidatesDelivered(staged, ambient.proposals, now),
    );
  }
  if (ambient.rules.length > 0) {
    const staged: readonly StagedRule[] = await readStagedRules(baseDir);
    await writeStagedRules(
      baseDir,
      markRulesDelivered(staged, ambient.rules, now),
    );
  }
  return renderAmbientMemory(ambient);
}
