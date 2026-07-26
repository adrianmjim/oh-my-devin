import { describe, expect, it } from 'vitest';
import { MARKDOWN_COMMENT_DELIMITERS } from './markdown-comment-delimiters';

describe('MARKDOWN_COMMENT_DELIMITERS', () => {
  it('wraps a marker in an HTML comment', () => {
    expect(MARKDOWN_COMMENT_DELIMITERS).toEqual({
      open: '<!-- ',
      close: ' -->',
    });
  });

  it('pads the marker so it reads as prose', () => {
    expect(MARKDOWN_COMMENT_DELIMITERS.open.endsWith(' ')).toBe(true);
    expect(MARKDOWN_COMMENT_DELIMITERS.close.startsWith(' ')).toBe(true);
  });
});
