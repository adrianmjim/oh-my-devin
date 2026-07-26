import { describe, expect, it } from 'vitest';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseAuthority } from './parse-authority';

describe('parseAuthority', () => {
  it('defaults to a human decision when the council declares none', () => {
    expect(parseAuthority(undefined)).toBe('human');
    expect(parseAuthority(null)).toBe('human');
  });

  it('defaults to a human decision when no consent policy is declared', () => {
    expect(parseAuthority({})).toBe('human');
  });

  it('yields the declared consent policy', () => {
    expect(parseAuthority({ on_consent: 'proceed' })).toBe('proceed');
  });

  it('refuses an authority that is not a mapping', () => {
    expect(() => parseAuthority('human')).toThrow(CouncilDeclarationError);
  });

  it('refuses an unknown consent policy', () => {
    expect(() => parseAuthority({ on_consent: 'auto' })).toThrow(
      /human or proceed/,
    );
  });
});
