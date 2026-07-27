import { BEGIN_TOKEN } from './begin-token';
import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimitersFor } from './comment-delimiters-for';
import type { CommentStyle } from './comment-style';
import { END_TOKEN } from './end-token';

export function isRegionMarkerLine(line: string, style: CommentStyle): boolean {
  const delimiters: CommentDelimiters = commentDelimitersFor(style);
  return (
    line.startsWith(`${delimiters.open}${BEGIN_TOKEN} `) ||
    line.startsWith(`${delimiters.open}${END_TOKEN} `)
  );
}
