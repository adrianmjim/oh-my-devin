import { describe, expect, it } from 'vitest';
import { isAuthorityPolicy } from './is-authority-policy';

describe('isAuthorityPolicy', () => {
  it('accepts the two authority policies', () => {
    expect(isAuthorityPolicy('human')).toBe(true);
    expect(isAuthorityPolicy('proceed')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isAuthorityPolicy('auto')).toBe(false);
    expect(isAuthorityPolicy(null)).toBe(false);
  });
});
