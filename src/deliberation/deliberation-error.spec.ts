import { describe, expect, it } from 'vitest';
import { DeliberationError } from './deliberation-error';

describe('DeliberationError', () => {
  it('is an error carrying its message', () => {
    const error: DeliberationError = new DeliberationError('seat failed');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('seat failed');
  });

  it('names itself so it survives serialization', () => {
    expect(new DeliberationError('x').name).toBe('DeliberationError');
  });
});
