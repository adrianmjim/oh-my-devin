import { describe, expect, it } from 'vitest';
import { isGateDecision } from './is-gate-decision';

describe('isGateDecision', () => {
  it('accepts the three gate decisions', () => {
    expect(isGateDecision('approve')).toBe(true);
    expect(isGateDecision('reject')).toBe(true);
    expect(isGateDecision('none')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isGateDecision('pending')).toBe(false);
    expect(isGateDecision(null)).toBe(false);
  });
});
