import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchFields } from './require-bench-fields';

describe('requireBenchFields', () => {
  it('returns the fields of a JSON object', () => {
    expect(requireBenchFields({ role: 'reviewer' }, 'truth.json')).toEqual({
      role: 'reviewer',
    });
  });

  it('rejects an array, naming the source', () => {
    expect(() => requireBenchFields([], 'truth.json')).toThrow(
      BenchFixtureError,
    );
    expect(() => requireBenchFields([], 'truth.json')).toThrow('truth.json');
  });

  it('rejects null and scalars', () => {
    expect(() => requireBenchFields(null, 'truth.json')).toThrow(
      BenchFixtureError,
    );
    expect(() => requireBenchFields('reviewer', 'truth.json')).toThrow(
      BenchFixtureError,
    );
  });
});
