import { describe, expect, it } from 'vitest';
import { isFailureTierOrNull } from './is-failure-tier-or-null';

describe('isFailureTierOrNull', () => {
  it('accepts null, which records a run that did not fail', () => {
    expect(isFailureTierOrNull(null)).toBe(true);
  });

  it('accepts every failure tier', () => {
    expect(isFailureTierOrNull('deny')).toBe(true);
    expect(isFailureTierOrNull('invalid_artifact')).toBe(true);
    expect(isFailureTierOrNull('budget')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isFailureTierOrNull('other')).toBe(false);
    expect(isFailureTierOrNull(undefined)).toBe(false);
  });
});
