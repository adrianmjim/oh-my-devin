import { BenchFixtureError } from './bench-fixture-error';

export function parseBenchJson(text: string, source: string): unknown {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BenchFixtureError(`"${source}" is not valid JSON`);
  }
  return parsed;
}
