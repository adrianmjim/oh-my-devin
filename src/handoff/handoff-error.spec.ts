import { describe, expect, it } from 'vitest';
import { HandoffError } from './handoff-error';

describe('HandoffError', () => {
  it('is an error carrying its message', () => {
    const error: HandoffError = new HandoffError('missing input');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('missing input');
  });

  it('names itself so it survives serialization', () => {
    expect(new HandoffError('x').name).toBe('HandoffError');
  });
});
