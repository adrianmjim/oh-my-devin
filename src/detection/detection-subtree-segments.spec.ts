import { describe, expect, it } from 'vitest';
import { MEMORY_SUBTREE_SEGMENTS } from '../memory/memory-subtree-segments';
import { DETECTION_SUBTREE_SEGMENTS } from './detection-subtree-segments';

describe('DETECTION_SUBTREE_SEGMENTS', () => {
  it('names a transient subtree under omd’s own directory', () => {
    expect(DETECTION_SUBTREE_SEGMENTS).toEqual(['.omd', 'detection']);
  });

  it('stands apart from the durable memory subtree', () => {
    expect(DETECTION_SUBTREE_SEGMENTS).not.toEqual(MEMORY_SUBTREE_SEGMENTS);
  });
});
