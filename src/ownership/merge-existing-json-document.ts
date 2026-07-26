import { canonicalJson } from './canonical-json';
import { digestContent } from './digest-content';
import { EDITED_REASON } from './edited-reason';
import { jsonDocumentMarker } from './json-document-marker';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import { NOT_JSON_REASON } from './not-json-reason';
import { parseJsonObject } from './parse-json-object';
import type { RegionMarker } from './region-marker';
import { UNMARKED_JSON_REASON } from './unmarked-json-reason';
import { withoutComment } from './without-comment';

export function mergeExistingJsonDocument(
  request: MergeRequest,
  rendered: string,
  existing: string,
): MergeOutcome {
  const document: Record<string, unknown> | null = parseJsonObject(existing);
  const marker: RegionMarker | null =
    document === null ? null : jsonDocumentMarker(document, request.framing.id);
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
