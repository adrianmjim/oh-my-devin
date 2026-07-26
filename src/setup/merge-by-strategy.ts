import { mergeContainer } from '../ownership/merge-container';
import { mergeJsonDocument } from '../ownership/merge-json-document';
import type { MergeOutcome } from '../ownership/merge-outcome';
import type { MergeRequest } from '../ownership/merge-request';
import { mergeUnitFile } from '../ownership/merge-unit-file';
import type { MergeTarget } from './merge-target';

export function mergeByStrategy(
  target: MergeTarget,
  existing: string | null,
): MergeOutcome {
  const request: MergeRequest = { existing, framing: target.framing };
  let outcome: MergeOutcome;
  if (target.strategy === 'container') {
    outcome = mergeContainer(request);
  } else if (target.strategy === 'unit') {
    outcome = mergeUnitFile(request);
  } else {
    outcome = mergeJsonDocument(request);
  }
  return outcome;
}
