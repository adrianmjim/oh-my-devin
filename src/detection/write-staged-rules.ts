import { writeFileAtomically } from '../memory/write-file-atomically';
import { DetectionStatePaths } from './detection-state-paths';
import type { StagedRule } from './staged-rule';

export async function writeStagedRules(
  baseDir: string,
  staged: readonly StagedRule[],
): Promise<void> {
  await writeFileAtomically(
    new DetectionStatePaths(baseDir).rules,
    `${JSON.stringify(staged, null, 2)}\n`,
  );
}
