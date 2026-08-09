import type { AnalystTruthDocument } from './analyst-truth-document';
import type { AnalystTruthItem } from './analyst-truth-item';
import { BenchFixtureError } from './bench-fixture-error';
import { isAnalystSurface } from './is-analyst-surface';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchKeywords } from './require-bench-keywords';
import { requireBenchString } from './require-bench-string';

export function parseAnalystTruth(
  fields: Record<string, unknown>,
  source: string,
): AnalystTruthDocument {
  const gaps: unknown = fields['gaps'];
  if (!Array.isArray(gaps)) {
    throw new BenchFixtureError(`"${source}#gaps" must be an array`);
  }
  return {
    role: 'analyst',
    gaps: gaps.map((entry: unknown, index: number): AnalystTruthItem => {
      const at: string = `${source}#gaps[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      const surface: unknown = item['surface'];
      if (!isAnalystSurface(surface)) {
        throw new BenchFixtureError(
          `"${at}.surface" must be "criterion", "question", "assumption" or "risk"`,
        );
      }
      return {
        id: requireBenchString(item['id'], `${at}.id`),
        keywords: requireBenchKeywords(item['keywords'], `${at}.keywords`),
        surface,
      };
    }),
  };
}
