import { describe, expect, it } from 'vitest';
import { ALL_MEMORY_CLASSES } from './all-memory-classes';

describe('ALL_MEMORY_CLASSES', () => {
  it('enumerates the v1 memory class vocabulary', () => {
    expect(ALL_MEMORY_CLASSES).toEqual([
      'profile',
      'notepad',
      'knowledge',
      'rules',
    ]);
  });

  it('holds no duplicate class', () => {
    expect(new Set(ALL_MEMORY_CLASSES).size).toBe(ALL_MEMORY_CLASSES.length);
  });
});
