import { mergeExistingJsonDocument } from './merge-existing-json-document';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import { NOT_JSON_REASON } from './not-json-reason';
import { parseJsonObject } from './parse-json-object';
import { renderJsonDocument } from './render-json-document';

export function mergeJsonDocument(request: MergeRequest): MergeOutcome {
  const installed: Record<string, unknown> | null = parseJsonObject(
    request.framing.content,
  );
  const existing: string | null = request.existing;
  let outcome: MergeOutcome;
  if (installed === null) {
    outcome = { kind: 'blocked', reason: NOT_JSON_REASON };
  } else if (existing === null || existing.trim() === '') {
    outcome = {
      kind: 'created',
      content: renderJsonDocument(request.framing, installed),
    };
  } else {
    outcome = mergeExistingJsonDocument(
      request,
      renderJsonDocument(request.framing, installed),
      existing,
    );
  }
  return outcome;
}
