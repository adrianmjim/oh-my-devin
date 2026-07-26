import { describe, expect, it } from 'vitest';
import { DeliberationError } from './deliberation-error';
import { requireTypedPosition } from './require-typed-position';
import type { SeatPosition } from './seat-position';

const POSITION: SeatPosition = {
  seat: 'security',
  lens: 'auth',
  kind: 'objection',
  domain: 'auth',
  severity: 'high',
  concern: 'leak',
  assumptions: [],
  reconsiderWhen: [],
};

describe('requireTypedPosition', () => {
  it('yields the typed position it is given', () => {
    expect(requireTypedPosition(POSITION)).toBe(POSITION);
  });

  it('refuses a clarification in the objection phase, naming the seat', () => {
    expect(() =>
      requireTypedPosition({
        seat: 'security',
        lens: 'auth',
        kind: 'clarification',
        questions: [],
      }),
    ).toThrow(DeliberationError);
    expect(() =>
      requireTypedPosition({
        seat: 'security',
        lens: 'auth',
        kind: 'clarification',
        questions: [],
      }),
    ).toThrow(/security/);
  });
});
