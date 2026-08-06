import { join } from 'node:path';
import type { FailureTier } from '../outcome/failure-tier';
import type { RunReport } from '../outcome/run-report';
import type { DimensionScore } from './dimension-score';
import type { DimensionWeight } from './dimension-weight';
import type { FixtureScore } from './fixture-score';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { readBenchFile } from './read-bench-file';
import { roleDimensionWeights } from './role-dimension-weights';
import type { RunFixtureOptions } from './run-fixture-options';
import { scoreFixture } from './score-fixture';
import { weightedComposite } from './weighted-composite';

export async function runFixture(
  options: RunFixtureOptions,
): Promise<FixtureScore> {
  const weights: readonly DimensionWeight[] = roleDimensionWeights(
    options.fixture.role,
  );

  let artifactText: string | null;
  let failureTier: FailureTier | null;
  let validationErrors: readonly string[];
  if (options.mode === 'dry') {
    artifactText = options.fixture.sampleArtifact;
    failureTier = null;
    validationErrors = [];
  } else {
    const report: RunReport = await options.run({
      roleName: options.fixture.role,
      task: options.fixture.task,
      workingDirectory: options.scratch.dir,
      model: options.model,
      runner: options.runner,
      clock: options.clock,
      provisionedWorktree: true,
    });
    artifactText = report.artifactValid
      ? await readBenchFile(join(options.scratch.dir, report.artifactPath))
      : null;
    failureTier = report.failureTier;
    validationErrors = report.validationErrors;
  }

  const dimensions: readonly DimensionScore[] =
    artifactText === null
      ? weights.map(
          (weight: DimensionWeight): DimensionScore => ({
            dimension: weight.dimension,
            score: 0,
          }),
        )
      : await scoreFixture(
          options.fixture,
          artifactText,
          options.scratch.dir,
          KEYWORD_MATCH_THRESHOLD,
          options.runner,
        );

  return {
    fixtureId: options.fixture.id,
    role: options.fixture.role,
    model: options.model,
    dimensions,
    composite: weightedComposite(dimensions, weights),
    artifactValid: artifactText !== null,
    failureTier,
    validationErrors,
  };
}
