import type { CommentStyle } from './comment-style';
import { isRegionMarkerLine } from './is-region-marker-line';

export function withoutRegionMarkers(
  content: string,
  style: CommentStyle,
): string {
  return content
    .split('\n')
    .filter((line: string): boolean => !isRegionMarkerLine(line, style))
    .join('\n');
}
