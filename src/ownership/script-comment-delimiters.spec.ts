import { describe, expect, it } from 'vitest';
import { SCRIPT_COMMENT_DELIMITERS } from './script-comment-delimiters';

describe('SCRIPT_COMMENT_DELIMITERS', () => {
  it('opens a line comment that runs to the end of the line', () => {
    expect(SCRIPT_COMMENT_DELIMITERS).toEqual({ open: '// ', close: '' });
  });
});
