import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MEMORY_SUBTREE_SEGMENTS } from './memory-subtree-segments';

describe('MEMORY_SUBTREE_SEGMENTS', () => {
  it('locates the durable store in a subtree under .omd', () => {
    expect(MEMORY_SUBTREE_SEGMENTS).toEqual(['.omd', 'memory']);
  });

  it('joins onto a project directory as the durable subtree', () => {
    expect(join('/project', ...MEMORY_SUBTREE_SEGMENTS)).toBe(
      join('/project', '.omd', 'memory'),
    );
  });
});
