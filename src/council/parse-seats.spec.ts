import { describe, expect, it } from 'vitest';
import type { WriteScope } from '../role/write-scope';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseSeats } from './parse-seats';
import type { RoleWriteScopes } from './role-write-scopes';

const KNOWN: RoleWriteScopes = new Map<string, WriteScope>([
  ['reviewer', 'artifact'],
]);

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
