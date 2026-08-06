import { BenchFixtureError } from './bench-fixture-error';
import type { FixtureManifestEntry } from './fixture-manifest-entry';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function parseFixtureManifestEntry(
  entry: unknown,
  source: string,
): FixtureManifestEntry {
  const fields: Record<string, unknown> = requireBenchFields(entry, source);
  const clean: unknown = fields['clean'];
  if (typeof clean !== 'boolean') {
    throw new BenchFixtureError(`"${source}.clean" must be a boolean`);
  }
  return {
    id: requireBenchString(fields['id'], `${source}.id`),
    clean,
  };
}
