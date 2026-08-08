import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchStrings } from './require-bench-strings';

describe('requireBenchStrings', () => {
  it('accepts an array of strings', () => {
    expect(requireBenchStrings(['a', 'b'], 'x')).toEqual(['a', 'b']);
  });

  it('accepts an empty array', () => {
    expect(requireBenchStrings([], 'x')).toEqual([]);
  });

  it('rejects a non-array value, naming the field', () => {
    expect(() => requireBenchStrings('a', 'truth.json#args')).toThrow(
      /truth\.json#args/,
    );
  });

  it('rejects a non-string entry', () => {
    expect(() => requireBenchStrings(['a', 1], 'x')).toThrow(BenchFixtureError);
  });
});
