import { describe, expect, it } from 'vitest';
import type { BeginSite } from './begin-site';
import { DUPLICATED_REGION_REASON } from './duplicated-region-reason';
import { ORPHAN_END_REASON } from './orphan-end-reason';
import { OUT_OF_ORDER_REASON } from './out-of-order-reason';
import type { RegionScan } from './region-scan';
import { resolveRegionScan } from './resolve-region-scan';
import type { SentinelSite } from './sentinel-site';
import { UNREADABLE_MARKER_REASON } from './unreadable-marker-reason';
import { UNTERMINATED_REGION_REASON } from './unterminated-region-reason';

const MARKER = { id: 'rules', version: '1.2.3', digest: 'sha256:abc' };
const BEGIN: BeginSite = { start: 0, length: 5, marker: MARKER };
const END: SentinelSite = { start: 11, length: 3 };
const CONTENT: string = 'BEGIN\nbody\nEND\n';

describe('resolveRegionScan', () => {
  it('is malformed when a marker could not be read', () => {
    expect(resolveRegionScan(CONTENT, [], [], true)).toEqual({
      kind: 'malformed',
      reason: UNREADABLE_MARKER_REASON,
    });
  });

  it('is malformed when the region appears more than once', () => {
    expect(resolveRegionScan(CONTENT, [BEGIN, BEGIN], [END], false)).toEqual({
      kind: 'malformed',
      reason: DUPLICATED_REGION_REASON,
    });
  });

  it('is absent when neither sentinel is present', () => {
    expect(resolveRegionScan(CONTENT, [], [], false)).toEqual({
      kind: 'absent',
    });
  });

  it('is malformed when the region was never closed', () => {
    expect(resolveRegionScan(CONTENT, [BEGIN], [], false)).toEqual({
      kind: 'malformed',
      reason: UNTERMINATED_REGION_REASON,
    });
  });

  it('is malformed when an end sentinel stands alone', () => {
    expect(resolveRegionScan(CONTENT, [], [END], false)).toEqual({
      kind: 'malformed',
      reason: ORPHAN_END_REASON,
    });
  });

  it('is malformed when the sentinels are out of order', () => {
    expect(
      resolveRegionScan(CONTENT, [{ ...BEGIN, start: 20 }], [END], false),
    ).toEqual({ kind: 'malformed', reason: OUT_OF_ORDER_REASON });
  });

  it('locates the region when both sentinels are well formed', () => {
    const scan: RegionScan = resolveRegionScan(CONTENT, [BEGIN], [END], false);

    expect(scan.kind).toBe('located');
  });
});
