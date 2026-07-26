import { describe, expect, it } from 'vitest';
import { PipelineError } from './pipeline-error';

describe('PipelineError', () => {
  it('is an error carrying its message', () => {
    const error: PipelineError = new PipelineError('no entry stage');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('no entry stage');
  });

  it('names itself so it survives serialization', () => {
    expect(new PipelineError('x').name).toBe('PipelineError');
  });
});
