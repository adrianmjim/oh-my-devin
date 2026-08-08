import type { AnalystArtifact } from './analyst-artifact';
import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchFields } from './require-bench-fields';
import { requireBenchString } from './require-bench-string';

export function parseAnalystArtifact(
  value: unknown,
  source: string,
): AnalystArtifact {
  const fields: Record<string, unknown> = requireBenchFields(value, source);
  const listOf = (
    key: string,
    parts: readonly string[],
  ): readonly string[] => {
    const raw: unknown = fields[key];
    if (!Array.isArray(raw)) {
      throw new BenchFixtureError(`"${source}#${key}" must be an array`);
    }
    return raw.map((entry: unknown, index: number): string => {
      const at: string = `${source}#${key}[${index}]`;
      const item: Record<string, unknown> = requireBenchFields(entry, at);
      return parts
        .map((part: string): string =>
          requireBenchString(item[part], `${at}.${part}`),
        )
        .join(' ');
    });
  };

  return {
    criteria: listOf('acceptanceCriteria', ['check', 'passesWhen']),
    questions: listOf('openQuestions', ['question', 'whyItMatters']),
    assumptions: listOf('assumptions', ['assumption', 'validationMethod']),
  };
}
