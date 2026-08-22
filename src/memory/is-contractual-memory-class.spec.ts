import { describe, expect, it } from 'vitest';
import { CONTRACTUAL_MEMORY_CLASSES } from './contractual-memory-classes';
import { isContractualMemoryClass } from './is-contractual-memory-class';

describe('isContractualMemoryClass', () => {
  it('recognizes every class a role may declare', () => {
    for (const memoryClass of CONTRACTUAL_MEMORY_CLASSES) {
      expect(isContractualMemoryClass(memoryClass)).toBe(true);
    }
  });

  it('rejects the rules class', () => {
    expect(isContractualMemoryClass('rules')).toBe(false);
  });

  it('rejects a value outside the store vocabulary', () => {
    expect(isContractualMemoryClass('transcripts')).toBe(false);
    expect(isContractualMemoryClass(undefined)).toBe(false);
  });
});
