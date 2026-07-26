import type { CommentDelimiters } from './comment-delimiters';
import { commentDelimiters } from './comment-delimiters';
import type { CommentStyle } from './comment-style';
import type { RegionMarker } from './region-marker';
import { BEGIN_TOKEN, REGION_NOTE } from './region-marker';
import { renderMarkerAttributes } from './render-marker-attributes';

export function renderBeginSentinel(
  style: CommentStyle,
  marker: RegionMarker,
): string {
  const delimiters: CommentDelimiters = commentDelimiters(style);
  const body: string = `${BEGIN_TOKEN} ${renderMarkerAttributes(marker)} | ${REGION_NOTE}`;
  return `${delimiters.open}${body}${delimiters.close}`;
}
