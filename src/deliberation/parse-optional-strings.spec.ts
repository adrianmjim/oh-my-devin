import { describe, expect, it } from 'vitest';
import type { CouncilSeat } from '../council/council-seat';
import { DeliberationError } from './deliberation-error';
import { parseOptionalStrings } from './parse-optional-strings';

const SEAT: CouncilSeat = {
  id: 'security',
  role: 'reviewer',
  lens: 'auth',
  proposer: false,
  contrarian: false,
  model: null,
};

describe('parseOptionalStrings', () => {
  it('is empty when the field is absent', () => {
    expect(parseOptionalStrings(SEAT, {}, 'assumptions')).toEqual([]);
  });

  it('yields the declared strings', () => {
    expect(
      parseOptionalStrings(SEAT, { assumptions: ['a', 'b'] }, 'assumptions'),
    ).toEqual(['a', 'b']);
  });

  it('refuses a field that is not a string array, naming it', () => {
    expect(() =>
      parseOptionalStrings(SEAT, { assumptions: 'a' }, 'assumptions'),
    ).toThrow(DeliberationError);
    expect(() =>
      parseOptionalStrings(SEAT, { assumptions: [1] }, 'assumptions'),
    ).toThrow(/assumptions/);
  });
});
