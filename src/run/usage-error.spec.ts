import { describe, expect, it } from 'vitest';
import { UsageError } from './usage-error';

describe('UsageError', () => {
  it('is an error carrying its message', () => {
    const error: UsageError = new UsageError('usage: omd run <role>');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('usage: omd run <role>');
  });

  it('names itself so the CLI can render it as a usage failure', () => {
    expect(new UsageError('x').name).toBe('UsageError');
  });
});
