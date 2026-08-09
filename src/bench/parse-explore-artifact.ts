import { BenchFixtureError } from './bench-fixture-error';
import type { ExploreArtifact } from './explore-artifact';
import type { ExploreFinding } from './explore-finding';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function parseExploreArtifact(
  value: unknown,
  source: string,
): ExploreArtifact {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const findings: unknown = fields['findings'];
  if (!Array.isArray(findings)) {
    throw new BenchFixtureError(`"${source}#findings" must be an array`);
  }
  const relationshipsRaw: unknown = fields['relationships'] ?? [];
  if (!Array.isArray(relationshipsRaw)) {
    throw new BenchFixtureError(`"${source}#relationships" must be an array`);
  }
  return {
    findings: findings.map(
      (entry: unknown, index: number): ExploreFinding => {
        const at: string = `${source}#findings[${index}]`;
        const finding: Record<string, unknown> = requireBenchFields(entry, at);
        return {
          path: requireBenchString(finding['path'], `${at}.path`),
          relevance: requireBenchString(
            finding['relevance'],
            `${at}.relevance`,
          ),
        };
      },
    ),
    relationships: relationshipsRaw.map(
      (entry: unknown, index: number): string => {
        const at: string = `${source}#relationships[${index}]`;
        const link: Record<string, unknown> = requireBenchFields(entry, at);
        return [
          requireBenchString(link['from'], `${at}.from`),
          requireBenchString(link['to'], `${at}.to`),
          requireBenchString(link['relationship'], `${at}.relationship`),
        ].join(' ');
      },
    ),
  };
}
