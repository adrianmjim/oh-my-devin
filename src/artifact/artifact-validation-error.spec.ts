import { describe, expect, it } from 'vitest';
import { ArtifactValidationError } from './artifact-validation-error';

describe('ArtifactValidationError', () => {
  it('is an error carrying its message', () => {
    const error: ArtifactValidationError = new ArtifactValidationError(
      'schema not found',
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('schema not found');
  });

  it('names itself so it survives serialization', () => {
    expect(new ArtifactValidationError('x').name).toBe(
      'ArtifactValidationError',
    );
  });
});
