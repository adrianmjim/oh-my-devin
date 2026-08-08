import { describe, expect, it } from 'vitest';
import { ALL_MEMORY_CLASSES } from './all-memory-classes';
import { isMemoryClass } from './is-memory-class';

describe('isMemoryClass', () => {
  it('recognizes every class of the v1 vocabulary', () => {
    for (const memoryClass of ALL_MEMORY_CLASSES) {
      expect(isMemoryClass(memoryClass)).toBe(true);
    }
  });

  it('recognizes the classes detection grows the store by', () => {
    expect(isMemoryClass('knowledge')).toBe(true);
    expect(isMemoryClass('rules')).toBe(true);
  });

  it('rejects a value outside the vocabulary', () => {
    expect(isMemoryClass('transcripts')).toBe(false);
    expect(isMemoryClass(undefined)).toBe(false);
    expect(isMemoryClass(['notepad'])).toBe(false);
  });
});
