import { describe, expect, it } from 'vitest';
import { ParallelError } from './parallel-error';

describe('ParallelError', () => {
  it('is an error carrying its message', () => {
    const error: ParallelError = new ParallelError('shared directory');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('shared directory');
  });

  it('names itself so it survives serialization', () => {
    expect(new ParallelError('x').name).toBe('ParallelError');
  });
});
