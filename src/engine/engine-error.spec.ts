import { describe, expect, it } from 'vitest';
import { EngineError } from './engine-error';

describe('EngineError', () => {
  it('is an error carrying its message', () => {
    const error: EngineError = new EngineError('unexpected listing');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('unexpected listing');
  });

  it('names itself so it survives serialization', () => {
    expect(new EngineError('x').name).toBe('EngineError');
  });
});
