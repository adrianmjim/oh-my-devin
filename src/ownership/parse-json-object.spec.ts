import { describe, expect, it } from 'vitest';
import { parseJsonObject } from './parse-json-object';

describe('parseJsonObject', () => {
  it('parses a json object', () => {
    expect(parseJsonObject('{"a": 1}')).toEqual({ a: 1 });
  });

  it('yields null for unparseable text', () => {
    expect(parseJsonObject('{nope')).toBeNull();
  });

  it('yields null for a json array', () => {
    expect(parseJsonObject('[1, 2]')).toBeNull();
  });

  it('yields null for a json scalar', () => {
    expect(parseJsonObject('42')).toBeNull();
  });

  it('yields null for json null', () => {
    expect(parseJsonObject('null')).toBeNull();
  });
});
