import { BenchFixtureError } from './bench-fixture-error';
import type { FixtureManifest } from './fixture-manifest';
import type { FixtureManifestEntry } from './fixture-manifest-entry';
import { isBenchRole } from './is-bench-role';
import { parseFixtureManifestEntry } from './parse-fixture-manifest-entry';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function validateFixtureManifest(
  value: unknown,
  source: string,
): FixtureManifest {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const role: unknown = fields['role'];
  if (!isBenchRole(role)) {
    throw new BenchFixtureError(
      `"${source}#role" must be reviewer, architect or executor`,
    );
  }
  const hypothesis: string = requireBenchString(
    fields['hypothesis'],
    `${source}#hypothesis`,
  );
  const entries: unknown = fields['fixtures'];
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new BenchFixtureError(
      `"${source}#fixtures" must be a non-empty array`,
    );
  }
  const fixtures: readonly FixtureManifestEntry[] = entries.map(
    (entry: unknown, index: number): FixtureManifestEntry =>
      parseFixtureManifestEntry(entry, `${source}#fixtures[${index}]`),
  );
  const ids: ReadonlySet<string> = new Set(
    fixtures.map((entry: FixtureManifestEntry): string => entry.id),
  );
  if (ids.size !== fixtures.length) {
    throw new BenchFixtureError(
      `"${source}#fixtures" must not repeat a fixture id`,
    );
  }
  return { role, hypothesis, fixtures };
}
