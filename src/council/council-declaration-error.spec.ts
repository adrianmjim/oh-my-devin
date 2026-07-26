import { describe, expect, it } from 'vitest';
import { CouncilDeclarationError } from './council-declaration-error';

describe('CouncilDeclarationError', () => {
  it('is an error carrying its message', () => {
    const error: CouncilDeclarationError = new CouncilDeclarationError(
      'seats must be a list',
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('seats must be a list');
  });

  it('names itself so it survives serialization', () => {
    expect(new CouncilDeclarationError('x').name).toBe(
      'CouncilDeclarationError',
    );
  });
});
