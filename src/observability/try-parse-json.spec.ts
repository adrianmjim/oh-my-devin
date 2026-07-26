import { describe, expect, it } from 'vitest';
import { tryParseJson } from './try-parse-json';

describe('tryParseJson', () => {
  it('parses a JSON line', () => {
    expect(tryParseJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('is undefined for a line that is not JSON', () => {
    expect(tryParseJson('not json')).toBeUndefined();
  });

  it('is undefined for an empty line', () => {
    expect(tryParseJson('')).toBeUndefined();
  });
});
