import { ProcessCommandRunner } from '../engine/process-command-runner';
import { runRole } from '../run/run-role';
import type { BenchFixture } from './bench-fixture';
import type { BenchRunMode } from './bench-run-mode';
import type { FixtureScore } from './fixture-score';
import type { RoleRunSurface } from './role-run-surface';
import { provisionScratchProject } from './provision-scratch-project';
import { runFixture } from './run-fixture';
import type { ScratchProject } from './scratch-project';

export async function runBenchCase(
  fixture: BenchFixture,
  mode: BenchRunMode,
  model: string,
  run: RoleRunSurface = runRole,
): Promise<FixtureScore> {
  const scratch: ScratchProject = await provisionScratchProject(fixture);
  let score: FixtureScore;
  try {
    score = await runFixture({
      fixture,
      mode,
      model,
      scratch,
      run,
      runner: new ProcessCommandRunner(scratch.dir),
      clock: (): number => Date.now(),
    });
  } finally {
    await scratch.cleanup();
  }
  return score;
}
