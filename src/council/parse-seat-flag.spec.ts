import { describe, expect, it } from 'vitest';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseSeatFlag } from './parse-seat-flag';

describe('parseSeatFlag', () => {
  it('is false when the seat declares nothing', () => {
    expect(parseSeatFlag(undefined, 'security', 'proposer')).toBe(false);
    expect(parseSeatFlag(null, 'security', 'proposer')).toBe(false);
  });

  it('yields the declared boolean', () => {
    expect(parseSeatFlag(true, 'security', 'proposer')).toBe(true);
  });

  it('refuses a non-boolean, naming the seat and field', () => {
    expect(() => parseSeatFlag('yes', 'security', 'proposer')).toThrow(
      CouncilDeclarationError,
    );
    expect(() => parseSeatFlag('yes', 'security', 'proposer')).toThrow(
      /security.*proposer/,
    );
  });
});
