import { COMMENT_KEY } from './comment-key';
import { parseMarkerAttributes } from './parse-marker-attributes';
import type { RegionMarker } from './region-marker';
import { REGION_TOKEN } from './region-token';

export function jsonDocumentMarker(
  document: Record<string, unknown>,
  id: string,
): RegionMarker | null {
  const comment: unknown = document[COMMENT_KEY];
  const carriesMarker: boolean =
    typeof comment === 'string' && comment.startsWith(REGION_TOKEN);
  const marker: RegionMarker | null = carriesMarker
    ? parseMarkerAttributes(comment as string)
    : null;
  return marker !== null && marker.id === id ? marker : null;
}
