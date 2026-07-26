import { describe, expect, it } from 'vitest';
import { isPositionKind } from './is-position-kind';

describe('isPositionKind', () => {
  it('accepts the two typed position kinds', () => {
    expect(isPositionKind('objection')).toBe(true);
    expect(isPositionKind('preference')).toBe(true);
  });

  it('refuses a clarification, which is not a typed position', () => {
    expect(isPositionKind('clarification')).toBe(false);
  });

  it('refuses anything else', () => {
    expect(isPositionKind('')).toBe(false);
    expect(isPositionKind(null)).toBe(false);
    expect(isPositionKind(3)).toBe(false);
  });
});
