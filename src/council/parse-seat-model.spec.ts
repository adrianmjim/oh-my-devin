import { describe, expect, it } from 'vitest';
import { CouncilDeclarationError } from './council-declaration-error';
import { parseSeatModel } from './parse-seat-model';

describe('parseSeatModel', () => {
  it('is null when the seat declares no model', () => {
    expect(parseSeatModel(undefined, 'security')).toBeNull();
    expect(parseSeatModel(null, 'security')).toBeNull();
  });

  it('yields the declared model', () => {
    expect(parseSeatModel('fast', 'security')).toBe('fast');
  });

  it('refuses an empty or non-string model', () => {
    expect(() => parseSeatModel('', 'security')).toThrow(
      CouncilDeclarationError,
    );
    expect(() => parseSeatModel(7, 'security')).toThrow(/security/);
  });
});
