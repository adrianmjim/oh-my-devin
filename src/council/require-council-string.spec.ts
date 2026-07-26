import { describe, expect, it } from 'vitest';
import { CouncilDeclarationError } from './council-declaration-error';
import { requireCouncilString } from './require-council-string';

describe('requireCouncilString', () => {
  it('yields a non-empty string', () => {
    expect(requireCouncilString('design', 'name')).toBe('design');
  });

  it('refuses an empty string, naming the field', () => {
    expect(() => requireCouncilString('', 'name')).toThrow(
      CouncilDeclarationError,
    );
    expect(() => requireCouncilString('', 'name')).toThrow(/name/);
  });

  it('refuses a value that is not a string', () => {
    expect(() => requireCouncilString(7, 'name')).toThrow(
      CouncilDeclarationError,
    );
  });
});
