import { frameUnit } from './frame-unit';
import { mergeLocatedRegion } from './merge-located-region';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import type { RegionScan } from './region-scan';
import { scanRegion } from './scan-region';

export const UNMARKED_REASON: string =
  'a file omd did not write already occupies that path';

export function mergeUnitFile(request: MergeRequest): MergeOutcome {
  const existing: string | null = request.existing;
  const framed: string = frameUnit(request.framing);
  let outcome: MergeOutcome;
  if (existing === null || existing.trim() === '') {
    outcome = { kind: 'created', content: framed };
  } else {
    const scan: RegionScan = scanRegion(existing, request.framing.id);
    if (scan.kind === 'malformed') {
      outcome = { kind: 'conflicted', reason: scan.reason };
    } else if (scan.kind === 'absent') {
      outcome = { kind: 'conflicted', reason: UNMARKED_REASON };
    } else {
      outcome = mergeLocatedRegion({
        existing,
        located: scan,
        digestInput: `${scan.before}${scan.body}${scan.after}`,
        merged: `${framed}${scan.after}`,
      });
    }
  }
  return outcome;
}
