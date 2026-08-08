import { afterAll, describe, expect, it } from 'vitest';
import { aggregateRoleScore } from './aggregate-role-score';
import { BENCH_BASELINES_DIR } from './bench-baselines-dir';
import type { BenchFixture } from './bench-fixture';
import { BENCH_FIXTURES_DIR } from './bench-fixtures-dir';
import { BENCH_GUARD_MESSAGE } from './bench-guard-message';
import { BENCH_RESULTS_DIR } from './bench-results-dir';
import type { BenchRunMode } from './bench-run-mode';
import { enumerateFixtures } from './enumerate-fixtures';
import { finalizeRoleBench } from './finalize-role-bench';
import type { FixtureScore } from './fixture-score';
import { resolveBenchMode } from './resolve-bench-mode';
import { resolveBenchModel } from './resolve-bench-model';
import type { RoleFixtureSet } from './role-fixture-set';
import { runBenchCase } from './run-bench-case';

const mode: BenchRunMode | null = resolveBenchMode(process.env);
const model: string = resolveBenchModel(process.env);
const set: RoleFixtureSet | null =
  mode === null ? null : await enumerateFixtures('executor', BENCH_FIXTURES_DIR);
const scores: FixtureScore[] = [];

describe('executor bench', () => {
  it('runs only on an explicit bench opt-in', () => {
    expect(mode, BENCH_GUARD_MESSAGE).not.toBeNull();
  });

  describe.runIf(set !== null)(
    set?.hypothesis ?? 'no fixture set loaded',
    () => {
      afterAll(async () => {
        if (mode === null || set === null) {
          return;
        }
        const path: string = await finalizeRoleBench({
          score: aggregateRoleScore(set, model, scores),
          expectedFixtureIds: set.fixtures.map(
            (fixture: BenchFixture): string => fixture.id,
          ),
          mode,
          env: process.env,
          resultsDir: BENCH_RESULTS_DIR,
          baselinesDir: BENCH_BASELINES_DIR,
        });
        console.info(`executor bench results written to ${path}`);
      });

      for (const fixture of set?.fixtures ?? []) {
        it(fixture.id, async () => {
          const score: FixtureScore = await runBenchCase(
            fixture,
            mode ?? 'dry',
            model,
          );
          scores.push(score);
          console.info(
            `executor/${fixture.id}: composite ${score.composite.toFixed(3)}`,
          );
          expect(score.composite).toBeGreaterThanOrEqual(0);
          expect(score.composite).toBeLessThanOrEqual(1);
        });
      }
    },
  );
});
