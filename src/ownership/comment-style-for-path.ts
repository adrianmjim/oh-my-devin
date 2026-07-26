import type { CommentStyle } from './comment-style';

export function commentStyleForPath(path: string): CommentStyle {
  let style: CommentStyle;
  if (path.endsWith('.md')) {
    style = 'markdown';
  } else if (path.endsWith('.yaml') || path.endsWith('.yml')) {
    style = 'yaml';
  } else {
    style = 'script';
  }
  return style;
}
