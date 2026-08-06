import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { requireBenchKeywords } from './require-bench-keywords';

describe('requireBenchKeywords', () => {
  it('returns a non-empty array of non-empty strings', () => {
    expect(requireBenchKeywords(['null', 'deref'], 'defects[0].keywords')).toEqual(
      ['null', 'deref'],
    );
  });

  it('rejects an empty array so every truth item stays pairable', () => {
    expect(() => requireBenchKeywords([], 'gaps[0].keywords')).toThrow(
      BenchFixtureError,
    );
    expect(() => requireBenchKeywords([], 'gaps[0].keywords')).toThrow(
      'gaps[0].keywords',
    );
  });

  it('rejects a blank keyword', () => {
    expect(() => requireBenchKeywords(['ok', ' '], 'keywords')).toThrow(
      BenchFixtureError,
    );
  });

  it('rejects a non-array value', () => {
    expect(() => requireBenchKeywords('null', 'keywords')).toThrow(
      BenchFixtureError,
    );
  });
});
