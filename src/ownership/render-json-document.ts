import { canonicalJson } from './canonical-json';
import { COMMENT_KEY } from './comment-key';
import { digestContent } from './digest-content';
import type { RegionFraming } from './region-framing';
import type { RegionMarker } from './region-marker';
import { REGION_NOTE } from './region-note';
import { REGION_TOKEN } from './region-token';
import { renderMarkerAttributes } from './render-marker-attributes';
import { withoutComment } from './without-comment';

export function renderJsonDocument(
  framing: RegionFraming,
  document: Record<string, unknown>,
): string {
  const body: Record<string, unknown> = withoutComment(document);
  const marker: RegionMarker = {
    id: framing.id,
    version: framing.version,
    digest: digestContent(canonicalJson(body)),
  };
  const comment: string = `${REGION_TOKEN} ${renderMarkerAttributes(marker)} | ${REGION_NOTE}`;
  return canonicalJson({ [COMMENT_KEY]: comment, ...body });
}
