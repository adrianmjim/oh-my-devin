import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimiters } from './comment-delimiters';
import type { CommentStyle } from './comment-style';
import { END_TOKEN } from './region-marker';

export function renderEndSentinel(style: CommentStyle, id: string): string {
  const delimiters: CommentDelimiters = commentDelimiters(style);
  return `${delimiters.open}${END_TOKEN} id=${id}${delimiters.close}`;
}
