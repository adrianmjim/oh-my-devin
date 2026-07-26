import { describe, expect, it } from 'vitest';
import { YAML_COMMENT_DELIMITERS } from './yaml-comment-delimiters';

describe('YAML_COMMENT_DELIMITERS', () => {
  it('opens a hash comment that runs to the end of the line', () => {
    expect(YAML_COMMENT_DELIMITERS).toEqual({ open: '# ', close: '' });
  });
});
