import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchString } from './require-bench-string';

describe('requireBenchString', () => {
  it('returns a non-empty string unchanged', () => {
    expect(requireBenchString('reviewer', 'role')).toBe('reviewer');
  });

  it('returns the trimmed value it validated', () => {
    expect(requireBenchString('  reviewer  ', 'role')).toBe('reviewer');
  });

  it('rejects a missing field by name', () => {
    expect(() => requireBenchString(undefined, 'hypothesis')).toThrow(
      BenchFixtureError,
    );
    expect(() => requireBenchString(undefined, 'hypothesis')).toThrow(
      'hypothesis',
    );
  });

  it('rejects a blank string so an empty hypothesis cannot pass', () => {
    expect(() => requireBenchString('   ', 'hypothesis')).toThrow(
      BenchFixtureError,
    );
  });

  it('rejects a non-string value', () => {
    expect(() => requireBenchString(7, 'id')).toThrow(BenchFixtureError);
  });
});
