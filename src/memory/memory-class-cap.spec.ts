import { describe, expect, it } from 'vitest';
import { ALL_MEMORY_CLASSES } from './all-memory-classes';
import { MEMORY_CLASS_CAP } from './memory-class-cap';

describe('MEMORY_CLASS_CAP', () => {
  it('caps every memory class', () => {
    expect(Object.keys(MEMORY_CLASS_CAP).sort()).toEqual(
      [...ALL_MEMORY_CLASSES].sort(),
    );
  });

  it('bounds each class by a positive whole number of entries', () => {
    for (const memoryClass of ALL_MEMORY_CLASSES) {
      const cap: number = MEMORY_CLASS_CAP[memoryClass];
      expect(Number.isInteger(cap)).toBe(true);
      expect(cap).toBeGreaterThan(0);
    }
  });

  it('holds the profile to a single snapshot', () => {
    expect(MEMORY_CLASS_CAP.profile).toBe(1);
  });

  it('bounds the notepad well below a preamble-flooding size', () => {
    expect(MEMORY_CLASS_CAP.notepad).toBe(50);
  });
});
