import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchString } from './require-bench-string';

export function requireBenchKeywords(
  value: unknown,
  field: string,
): readonly string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new BenchFixtureError(
      `"${field}" must be a non-empty array of keywords`,
    );
  }
  return value.map((entry: unknown, index: number): string =>
    requireBenchString(entry, `${field}[${index}]`),
  );
}
