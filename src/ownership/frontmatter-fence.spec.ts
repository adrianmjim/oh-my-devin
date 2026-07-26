import { describe, expect, it } from 'vitest';
import { FRONTMATTER_FENCE } from './frontmatter-fence';

describe('FRONTMATTER_FENCE', () => {
  it('is the triple dash that fences frontmatter', () => {
    expect(FRONTMATTER_FENCE).toBe('---');
  });
});
