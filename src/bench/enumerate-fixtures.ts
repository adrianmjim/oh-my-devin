import { join } from 'node:path';
import type { BenchFixture } from './bench-fixture';
import { BenchFixtureError } from './bench-fixture-error';
import type { BenchRole } from './bench-role';
import type { FixtureManifest } from './fixture-manifest';
import type { FixtureManifestEntry } from './fixture-manifest-entry';
import { loadFixture } from './load-fixture';
import { parseBenchJson } from './parse-bench-json';
import { readBenchFile } from './read-bench-file';
import type { RoleFixtureSet } from './role-fixture-set';
import { validateFixtureManifest } from './validate-fixture-manifest';

export async function enumerateFixtures(
  role: BenchRole,
  fixturesDir: string,
): Promise<RoleFixtureSet> {
  const roleDir: string = join(fixturesDir, role);
  const manifestPath: string = join(roleDir, 'manifest.json');
  const manifest: FixtureManifest = validateFixtureManifest(
    parseBenchJson(await readBenchFile(manifestPath), manifestPath),
    manifestPath,
  );
  if (manifest.role !== role) {
    throw new BenchFixtureError(
      `"${manifestPath}" declares role "${manifest.role}" under the "${role}" fixture set`,
    );
  }
  const fixtures: readonly BenchFixture[] = await Promise.all(
    manifest.fixtures.map(
      (entry: FixtureManifestEntry): Promise<BenchFixture> =>
        loadFixture(role, roleDir, entry),
    ),
  );
  return { role, hypothesis: manifest.hypothesis, fixtures };
}
