import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimitersFor } from './comment-delimiters-for';
import type { CommentStyle } from './comment-style';
import { END_TOKEN } from './end-token';

export function renderEndSentinel(style: CommentStyle, id: string): string {
  const delimiters: CommentDelimiters = commentDelimitersFor(style);
  return `${delimiters.open}${END_TOKEN} id=${id}${delimiters.close}`;
}
