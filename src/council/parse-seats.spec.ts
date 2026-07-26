import { describe, expect, it } from 'vitest';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseSeats } from './parse-seats';

const KNOWN: readonly string[] = ['reviewer'];

describe('parseSeats', () => {
  it('parses a list of seats and assigns their ids', () => {
    expect(parseSeats([{ role: 'reviewer', lens: 'auth' }], KNOWN)[0]?.id).toBe(
      'reviewer',
    );
  });

  it('refuses a missing or empty seat list', () => {
    expect(() => parseSeats(undefined, KNOWN)).toThrow(CouncilDeclarationError);
    expect(() => parseSeats([], KNOWN)).toThrow(/non-empty/);
  });
});
