import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimitersFor } from './comment-delimiters-for';
import type { CommentStyle } from './comment-style';
import type { RegionMarker } from './region-marker';
import { BEGIN_TOKEN } from './begin-token';
import { REGION_NOTE } from './region-note';
import { renderMarkerAttributes } from './render-marker-attributes';

export function renderBeginSentinel(
  style: CommentStyle,
  marker: RegionMarker,
): string {
  const delimiters: CommentDelimiters = commentDelimitersFor(style);
  const body: string = `${BEGIN_TOKEN} ${renderMarkerAttributes(marker)} | ${REGION_NOTE}`;
  return `${delimiters.open}${body}${delimiters.close}`;
}
