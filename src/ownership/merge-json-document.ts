import { canonicalJson } from './canonical-json';
import { digestContent } from './digest-content';
import type { MergeOutcome } from './merge-outcome';
import { EDITED_REASON } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import { parseJsonObject } from './parse-json-object';
import { parseMarkerAttributes } from './parse-marker-attributes';
import type { RegionFraming } from './region-framing';
import type { RegionMarker } from './region-marker';
import { REGION_NOTE, REGION_TOKEN } from './region-marker';
import { renderMarkerAttributes } from './render-marker-attributes';

const COMMENT_KEY: string = '$comment';

export const NOT_JSON_REASON: string = 'it is not a JSON object omd can read';
export const UNMARKED_JSON_REASON: string =
  'a document omd did not write already occupies that path';

function withoutComment(
  document: Record<string, unknown>,
): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(document)) {
    if (key !== COMMENT_KEY) {
      copy[key] = value;
    }
  }
  return copy;
}

function markerOf(
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

function render(
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

function mergeExisting(
  request: MergeRequest,
  rendered: string,
  existing: string,
): MergeOutcome {
  const document: Record<string, unknown> | null = parseJsonObject(existing);
  const marker: RegionMarker | null =
    document === null ? null : markerOf(document, request.framing.id);
  let outcome: MergeOutcome;
  if (document === null) {
    outcome = { kind: 'conflicted', reason: NOT_JSON_REASON };
  } else if (marker === null) {
    outcome = { kind: 'conflicted', reason: UNMARKED_JSON_REASON };
  } else if (
    digestContent(canonicalJson(withoutComment(document))) !== marker.digest
  ) {
    outcome = { kind: 'preserved', reason: EDITED_REASON };
  } else if (rendered === existing) {
    outcome = { kind: 'unchanged' };
  } else {
    outcome = { kind: 'updated', content: rendered };
  }
  return outcome;
}

export function mergeJsonDocument(request: MergeRequest): MergeOutcome {
  const installed: Record<string, unknown> | null = parseJsonObject(
    request.framing.content,
  );
  const existing: string | null = request.existing;
  let outcome: MergeOutcome;
  if (installed === null) {
    outcome = { kind: 'blocked', reason: NOT_JSON_REASON };
  } else if (existing === null || existing.trim() === '') {
    outcome = { kind: 'created', content: render(request.framing, installed) };
  } else {
    outcome = mergeExisting(
      request,
      render(request.framing, installed),
      existing,
    );
  }
  return outcome;
}
