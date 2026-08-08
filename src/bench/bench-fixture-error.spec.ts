import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';

describe('BenchFixtureError', () => {
  it('is an error carrying its message', () => {
    const error: BenchFixtureError = new BenchFixtureError('truth.json is bad');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('truth.json is bad');
  });

  it('names itself so it survives serialization', () => {
    expect(new BenchFixtureError('x').name).toBe('BenchFixtureError');
  });
});
