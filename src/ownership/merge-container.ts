import { frameRegion } from './frame-region';
import { mergeLocatedRegion } from './merge-located-region';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import type { RegionScan } from './region-scan';
import { scanRegion } from './scan-region';

function appendRegion(existing: string, framed: string): string {
  const base: string = existing.endsWith('\n') ? existing : `${existing}\n`;
  return `${base}\n${framed}`;
}

export function mergeContainer(request: MergeRequest): MergeOutcome {
  const existing: string | null = request.existing;
  const framed: string = frameRegion(request.framing);
  let outcome: MergeOutcome;
  if (existing === null || existing.trim() === '') {
    outcome = { kind: 'created', content: framed };
  } else {
    const scan: RegionScan = scanRegion(existing, request.framing.id);
    if (scan.kind === 'malformed') {
      outcome = { kind: 'conflicted', reason: scan.reason };
    } else if (scan.kind === 'absent') {
      outcome = { kind: 'updated', content: appendRegion(existing, framed) };
    } else {
      outcome = mergeLocatedRegion({
        existing,
        located: scan,
        digestInput: scan.body,
        merged: `${scan.before}${framed}${scan.after}`,
      });
    }
  }
  return outcome;
}
