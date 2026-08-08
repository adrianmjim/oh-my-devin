import { describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { parseBenchJson } from './parse-bench-json';

describe('parseBenchJson', () => {
  it('parses valid JSON', () => {
    expect(parseBenchJson('{"role":"reviewer"}', 'truth.json')).toEqual({
      role: 'reviewer',
    });
  });

  it('names the source when the text is not JSON', () => {
    expect(() => parseBenchJson('{', 'truth.json')).toThrow(BenchFixtureError);
    expect(() => parseBenchJson('{', 'truth.json')).toThrow('truth.json');
  });
});
