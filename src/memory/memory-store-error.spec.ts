import { describe, expect, it } from 'vitest';
import { MemoryStoreError } from './memory-store-error';

describe('MemoryStoreError', () => {
  it('is an error carrying its message', () => {
    const error: MemoryStoreError = new MemoryStoreError('store unreadable');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('store unreadable');
  });

  it('names itself so it survives serialization', () => {
    expect(new MemoryStoreError('x').name).toBe('MemoryStoreError');
  });
});
