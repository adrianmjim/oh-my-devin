import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchString } from './require-bench-string';

export function requireBenchStrings(
  value: unknown,
  field: string,
): readonly string[] {
  if (!Array.isArray(value)) {
    throw new BenchFixtureError(`"${field}" must be an array of strings`);
  }
  return value.map((entry: unknown, index: number): string =>
    requireBenchString(entry, `${field}[${index}]`),
  );
}
