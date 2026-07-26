import { describe, expect, it } from 'vitest';
import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimitersFor } from './comment-delimiters-for';

describe('commentDelimitersFor', () => {
  it('wraps markdown in an html comment pair', () => {
    const delimiters: CommentDelimiters = commentDelimitersFor('markdown');

    expect(delimiters).toEqual({ open: '<!-- ', close: ' -->' });
  });

  it('opens yaml with a hash and closes with nothing', () => {
    expect(commentDelimitersFor('yaml')).toEqual({ open: '# ', close: '' });
  });

  it('opens script with a double slash and closes with nothing', () => {
    expect(commentDelimitersFor('script')).toEqual({ open: '// ', close: '' });
  });
});
