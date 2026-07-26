import type { BeginSite } from './begin-site';
import { DUPLICATED_REGION_REASON } from './duplicated-region-reason';
import { locateRegion } from './locate-region';
import { ORPHAN_END_REASON } from './orphan-end-reason';
import { OUT_OF_ORDER_REASON } from './out-of-order-reason';
import type { RegionScan } from './region-scan';
import type { SentinelSite } from './sentinel-site';
import { UNREADABLE_MARKER_REASON } from './unreadable-marker-reason';
import { UNTERMINATED_REGION_REASON } from './unterminated-region-reason';

export function resolveRegionScan(
  content: string,
  begins: readonly BeginSite[],
  ends: readonly SentinelSite[],
  unreadable: boolean,
): RegionScan {
  const begin: BeginSite | undefined = begins[0];
  const end: SentinelSite | undefined = ends[0];
  let scan: RegionScan;
  if (unreadable) {
    scan = { kind: 'malformed', reason: UNREADABLE_MARKER_REASON };
  } else if (begins.length > 1 || ends.length > 1) {
    scan = { kind: 'malformed', reason: DUPLICATED_REGION_REASON };
  } else if (begin === undefined && end === undefined) {
    scan = { kind: 'absent' };
  } else if (end === undefined) {
    scan = { kind: 'malformed', reason: UNTERMINATED_REGION_REASON };
  } else if (begin === undefined) {
    scan = { kind: 'malformed', reason: ORPHAN_END_REASON };
  } else if (end.start < begin.start) {
    scan = { kind: 'malformed', reason: OUT_OF_ORDER_REASON };
  } else {
    scan = locateRegion(content, begin, end);
  }
  return scan;
}
