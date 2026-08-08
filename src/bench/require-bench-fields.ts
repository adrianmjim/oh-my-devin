import { BenchFixtureError } from './bench-fixture-error';

export function requireBenchFields(
  value: unknown,
  source: string,
): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new BenchFixtureError(`"${source}" must be a JSON object`);
  }
  return value as Record<string, unknown>;
}
