import type { AmbientMemory } from './ambient-memory';
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
  prompt: string,
  now: number,
): Promise<string> {
  const ambient: AmbientMemory = await composeAmbientMemory(
    baseDir,
    prompt,
    now,
  );
  if (ambient.proposals.length > 0) {
    const staged: readonly StagedCandidate[] =
      await readStagedCandidates(baseDir);
    await writeStagedCandidates(
      baseDir,
      markCandidatesDelivered(
        staged,
        ambient.proposals.map(
          (candidate: StagedCandidate): string => candidate.principle,
        ),
        now,
      ),
    );
  }
  if (ambient.rules.length > 0) {
    const staged: readonly StagedRule[] = await readStagedRules(baseDir);
    await writeStagedRules(
      baseDir,
      markRulesDelivered(
        staged,
        ambient.rules.map((rule: StagedRule): string => rule.text),
        now,
      ),
    );
  }
  return renderAmbientMemory(ambient);
}
