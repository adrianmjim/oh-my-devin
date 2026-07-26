import type { CommentDelimiters } from './comment-delimiters';
import type { CommentStyle } from './comment-style';
import { MARKDOWN_COMMENT_DELIMITERS } from './markdown-comment-delimiters';
import { SCRIPT_COMMENT_DELIMITERS } from './script-comment-delimiters';
import { YAML_COMMENT_DELIMITERS } from './yaml-comment-delimiters';

export function commentDelimitersFor(style: CommentStyle): CommentDelimiters {
  const delimiters: CommentDelimiters =
    style === 'markdown'
      ? MARKDOWN_COMMENT_DELIMITERS
      : style === 'yaml'
        ? YAML_COMMENT_DELIMITERS
        : SCRIPT_COMMENT_DELIMITERS;
  return delimiters;
}
