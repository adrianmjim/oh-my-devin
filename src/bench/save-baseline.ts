import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { BenchBaseline } from './bench-baseline';
import type { FixtureScore } from './fixture-score';
import type { SaveBaselineOptions } from './save-baseline-options';

export async function saveBaseline(
  options: SaveBaselineOptions,
): Promise<string | null> {
  const scoredIds: ReadonlySet<string> = new Set(
    options.score.fixtures.map(
      (fixture: FixtureScore): string => fixture.fixtureId,
    ),
  );
  const complete: boolean =
    options.expectedFixtureIds.length > 0 &&
    options.expectedFixtureIds.every((id: string): boolean =>
      scoredIds.has(id),
    );
  const allValid: boolean = options.score.fixtures.every(
    (fixture: FixtureScore): boolean => fixture.artifactValid,
  );
  let path: string | null = null;
  if (options.requested && complete && allValid) {
    const baseline: BenchBaseline = {
      role: options.score.role,
      promptDigest: options.promptDigest,
      omdVersion: options.omdVersion,
      engineVersion: options.engineVersion,
      model: options.score.model,
      fixtures: options.score.fixtures,
      composite: options.score.composite,
    };
    await mkdir(options.baselinesDir, { recursive: true });
    path = join(options.baselinesDir, `${options.score.role}.json`);
    await writeFile(path, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
  }
  return path;
}
