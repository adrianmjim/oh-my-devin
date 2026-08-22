import { writeFileAtomically } from '../memory/write-file-atomically';
import { DetectionStatePaths } from './detection-state-paths';
import type { StagedCandidate } from './staged-candidate';

export async function writeStagedCandidates(
  baseDir: string,
  staged: readonly StagedCandidate[],
): Promise<void> {
  await writeFileAtomically(
    new DetectionStatePaths(baseDir).candidates,
    `${JSON.stringify(staged, null, 2)}\n`,
  );
}
