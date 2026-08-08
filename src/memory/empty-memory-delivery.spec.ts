import { describe, expect, it } from 'vitest';
import { EMPTY_MEMORY_DELIVERY } from './empty-memory-delivery';

describe('EMPTY_MEMORY_DELIVERY', () => {
  it('carries no memory of any class', () => {
    expect(EMPTY_MEMORY_DELIVERY).toEqual({ profile: null, notepad: [] });
  });
});
