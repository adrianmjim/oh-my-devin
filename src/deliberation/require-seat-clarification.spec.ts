import { describe, expect, it } from 'vitest';
import { DeliberationError } from './deliberation-error';
import { requireSeatClarification } from './require-seat-clarification';
import type { SeatClarification } from './seat-clarification';

const CLARIFICATION: SeatClarification = {
  seat: 'security',
  lens: 'auth',
  kind: 'clarification',
  questions: ['why?'],
};

describe('requireSeatClarification', () => {
  it('yields the clarification it is given', () => {
    expect(requireSeatClarification(CLARIFICATION)).toBe(CLARIFICATION);
  });

  it('refuses a typed position in the clarification phase', () => {
    expect(() =>
      requireSeatClarification({
        seat: 'security',
        lens: 'auth',
        kind: 'objection',
        domain: 'auth',
        severity: 'high',
        concern: 'leak',
        assumptions: [],
        reconsiderWhen: [],
      }),
    ).toThrow(DeliberationError);
  });
});
