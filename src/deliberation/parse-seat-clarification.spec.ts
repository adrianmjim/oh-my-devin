import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { parseSeatClarification } from './parse-seat-clarification';

const SEAT: CouncilSeat = {
  id: 'security',
  role: 'reviewer',
  lens: 'auth',
  proposer: false,
  contrarian: false,
  model: null,
};

describe('parseSeatClarification', () => {
  it('yields a clarification carrying the seat identity and lens', () => {
    expect(parseSeatClarification(SEAT, { questions: ['why?'] })).toEqual({
      seat: 'security',
      lens: 'auth',
      kind: 'clarification',
      questions: ['why?'],
    });
  });

  it('accepts an empty question list', () => {
    expect(parseSeatClarification(SEAT, { questions: [] }).kind).toBe(
      'clarification',
    );
  });

  it('refuses a clarification without a string array of questions', () => {
    expect(() => parseSeatClarification(SEAT, {})).toThrow(DeliberationError);
    expect(() => parseSeatClarification(SEAT, { questions: 'why' })).toThrow(
      /questions/,
    );
  });
});
