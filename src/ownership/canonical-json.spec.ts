import { describe, expect, it } from 'vitest';
import { canonicalJson } from './canonical-json';

describe('canonicalJson', () => {
  it('renders two-space-indented json with a trailing newline', () => {
    expect(canonicalJson({ a: 1 })).toBe('{\n  "a": 1\n}\n');
  });

  it('renders an empty object on one line', () => {
    expect(canonicalJson({})).toBe('{}\n');
  });
});
