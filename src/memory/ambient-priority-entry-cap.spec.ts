import { describe, expect, it } from 'vitest';
import { AMBIENT_PRIORITY_ENTRY_CAP } from './ambient-priority-entry-cap';
import { MEMORY_CLASS_CAP } from './memory-class-cap';

describe('AMBIENT_PRIORITY_ENTRY_CAP', () => {
  it('bounds the ambient payload to a handful of entries', () => {
    expect(AMBIENT_PRIORITY_ENTRY_CAP).toBe(5);
  });

  it('is a positive whole number of entries', () => {
    expect(Number.isInteger(AMBIENT_PRIORITY_ENTRY_CAP)).toBe(true);
    expect(AMBIENT_PRIORITY_ENTRY_CAP).toBeGreaterThan(0);
  });

  it('bounds the ambient payload tighter than the notepad itself', () => {
    expect(AMBIENT_PRIORITY_ENTRY_CAP).toBeLessThan(MEMORY_CLASS_CAP.notepad);
  });
});
