import { describe, expect, it } from 'vitest';
import { isContextPolicy } from './is-context-policy';

describe('isContextPolicy', () => {
  it('accepts the two context policies', () => {
    expect(isContextPolicy('isolated')).toBe(true);
    expect(isContextPolicy('shared')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isContextPolicy('private')).toBe(false);
    expect(isContextPolicy(null)).toBe(false);
  });
});
