import type { CommentStyle } from './comment-style';

export interface CommentDelimiters {
  readonly open: string;
  readonly close: string;
}

const MARKDOWN: CommentDelimiters = { open: '<!-- ', close: ' -->' };
const YAML: CommentDelimiters = { open: '# ', close: '' };
const SCRIPT: CommentDelimiters = { open: '// ', close: '' };

export function commentDelimiters(style: CommentStyle): CommentDelimiters {
  const delimiters: CommentDelimiters =
    style === 'markdown' ? MARKDOWN : style === 'yaml' ? YAML : SCRIPT;
  return delimiters;
}
