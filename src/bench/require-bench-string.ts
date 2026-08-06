import { BenchFixtureError } from './bench-fixture-error';

export function requireBenchString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BenchFixtureError(`"${field}" must be a non-empty string`);
  }
  return value;
}
