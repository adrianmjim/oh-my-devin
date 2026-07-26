import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { parsePositionObject } from './parse-position-object';

const SEAT: CouncilSeat = {
  id: 'security',
  role: 'reviewer',
  lens: 'auth',
  proposer: false,
  contrarian: false,
  model: null,
};

describe('parsePositionObject', () => {
  it('parses a JSON object', () => {
    expect(parsePositionObject(SEAT, '{"kind":"preference"}')).toEqual({
      kind: 'preference',
    });
  });

  it('refuses invalid JSON, naming the seat', () => {
    expect(() => parsePositionObject(SEAT, 'nope')).toThrow(DeliberationError);
    expect(() => parsePositionObject(SEAT, 'nope')).toThrow(/security/);
  });

  it('refuses a payload that is not an object', () => {
    expect(() => parsePositionObject(SEAT, '[]')).toThrow(DeliberationError);
    expect(() => parsePositionObject(SEAT, 'null')).toThrow(DeliberationError);
    expect(() => parsePositionObject(SEAT, '"text"')).toThrow(
      DeliberationError,
    );
  });
});
