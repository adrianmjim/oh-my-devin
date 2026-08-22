import { describe, expect, it } from 'vitest';
import { EMPTY_AMBIENT_MEMORY } from './empty-ambient-memory';

describe('EMPTY_AMBIENT_MEMORY', () => {
  it('carries no content of any class', () => {
    expect(EMPTY_AMBIENT_MEMORY).toEqual({
      priority: [],
      proposals: [],
      knowledge: [],
      rules: [],
    });
  });
});
