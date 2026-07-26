import { describe, expect, it } from 'vitest';
import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimiters } from './comment-delimiters';

describe('commentDelimiters', () => {
  it('wraps markdown in an html comment pair', () => {
    const delimiters: CommentDelimiters = commentDelimiters('markdown');

    expect(delimiters).toEqual({ open: '<!-- ', close: ' -->' });
  });

  it('opens yaml with a hash and closes with nothing', () => {
    expect(commentDelimiters('yaml')).toEqual({ open: '# ', close: '' });
  });

  it('opens script with a double slash and closes with nothing', () => {
    expect(commentDelimiters('script')).toEqual({ open: '// ', close: '' });
  });
});
