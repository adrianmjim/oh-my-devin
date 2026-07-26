import { describe, expect, it } from 'vitest';
import { COMMENT_KEY } from './comment-key';

describe('COMMENT_KEY', () => {
  it('is the conventional JSON comment key', () => {
    expect(COMMENT_KEY).toBe('$comment');
  });
});
