import { describe, expect, it } from 'vitest';
import { ALL_MEMORY_CLASSES } from './all-memory-classes';
import { CONTRACTUAL_MEMORY_CLASSES } from './contractual-memory-classes';

describe('CONTRACTUAL_MEMORY_CLASSES', () => {
  it('enumerates the classes a role may declare', () => {
    expect(CONTRACTUAL_MEMORY_CLASSES).toEqual([
      'profile',
      'notepad',
      'knowledge',
    ]);
  });

  it('leaves the rules class out of the contractual vocabulary', () => {
    expect(CONTRACTUAL_MEMORY_CLASSES).not.toContain('rules');
  });

  it('draws every class from the store vocabulary', () => {
    for (const memoryClass of CONTRACTUAL_MEMORY_CLASSES) {
      expect(ALL_MEMORY_CLASSES).toContain(memoryClass);
    }
  });
});
