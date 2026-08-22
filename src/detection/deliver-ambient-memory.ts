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
import { withDetectionStateLock } from './with-detection-state-lock';
import { writeStagedCandidates } from './write-staged-candidates';
import { writeStagedRules } from './write-staged-rules';

export async function deliverAmbientMemory(
  baseDir: string,
  query: AmbientQuery,
  now: number,
): Promise<string> {
  const ambient: AmbientMemory = await withDetectionStateLock(
    baseDir,
    async (): Promise<AmbientMemory> => {
      const composed: AmbientMemory = await composeAmbientMemory(
        baseDir,
        query,
        now,
      );
      if (composed.proposals.length > 0) {
        const staged: readonly StagedCandidate[] =
          await readStagedCandidates(baseDir);
        await writeStagedCandidates(
          baseDir,
          markCandidatesDelivered(staged, composed.proposals, now),
        );
      }
      if (composed.rules.length > 0) {
        const staged: readonly StagedRule[] = await readStagedRules(baseDir);
        await writeStagedRules(
          baseDir,
          markRulesDelivered(staged, composed.rules, now),
        );
      }
      return composed;
    },
  );
  return renderAmbientMemory(ambient);
}
