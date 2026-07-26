import { describe, expect, it } from 'vitest';
import { isBlockingPosition } from './is-blocking-position';
import type { TypedPosition } from './typed-position';

function position(overrides: Partial<TypedPosition>): TypedPosition {
  return {
    seat: 'security',
    lens: 'auth',
    kind: 'objection',
    domain: 'auth',
    severity: 'high',
    concern: 'leak',
    assumptions: [],
    reconsiderWhen: [],
    ...overrides,
  };
}

describe('isBlockingPosition', () => {
  it('blocks on an objection at or above the threshold within its lens', () => {
    expect(isBlockingPosition(position({}), 'high')).toBe(true);
  });

  it('never blocks on a preference', () => {
    expect(isBlockingPosition(position({ kind: 'preference' }), 'low')).toBe(
      false,
    );
  });

  it('does not block below the threshold', () => {
    expect(isBlockingPosition(position({ severity: 'low' }), 'high')).toBe(
      false,
    );
  });

  it('does not block outside the seat lens', () => {
    expect(isBlockingPosition(position({ domain: 'latency' }), 'high')).toBe(
      false,
    );
  });
});
