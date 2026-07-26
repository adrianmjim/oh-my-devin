import { describe, expect, it } from 'vitest';
import { LEVEL_HINT } from './level-hint';

describe('LEVEL_HINT', () => {
  it('names both accepted answers', () => {
    expect(LEVEL_HINT).toBe('Please answer "project" or "user".\n');
  });

  it('ends with a newline so the prompt reappears on its own line', () => {
    expect(LEVEL_HINT.endsWith('\n')).toBe(true);
  });
});
