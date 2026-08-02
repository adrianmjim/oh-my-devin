import { describe, expect, it } from 'vitest';
import { LIVENESS_STALL_THRESHOLD_MS } from './liveness-stall-threshold-ms';
import { RUN_RECORD_SCAN_WINDOW_MS } from './run-record-scan-window-ms';
import { TERMINATED_TAIL_WINDOW_MS } from './terminated-tail-window-ms';

describe('RUN_RECORD_SCAN_WINDOW_MS', () => {
  it('declares a scan window on the order of days', () => {
    expect(RUN_RECORD_SCAN_WINDOW_MS).toBeGreaterThanOrEqual(86400000);
  });

  it('outlives the stall threshold so a stalled run stays enumerable', () => {
    expect(RUN_RECORD_SCAN_WINDOW_MS).toBeGreaterThan(
      LIVENESS_STALL_THRESHOLD_MS,
    );
  });

  it('reaches further back than the terminated tail window', () => {
    expect(RUN_RECORD_SCAN_WINDOW_MS).toBeGreaterThan(
      TERMINATED_TAIL_WINDOW_MS,
    );
  });
});
