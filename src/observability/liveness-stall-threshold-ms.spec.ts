import { describe, expect, it } from 'vitest';
import { LIVENESS_REFRESH_MS } from './liveness-refresh-ms';
import { LIVENESS_STALL_THRESHOLD_MS } from './liveness-stall-threshold-ms';

describe('LIVENESS_STALL_THRESHOLD_MS', () => {
  it('declares a stall threshold on the order of minutes', () => {
    expect(LIVENESS_STALL_THRESHOLD_MS).toBeGreaterThanOrEqual(60000);
  });

  it('leaves room for several refreshes before a run reads as stalled', () => {
    expect(LIVENESS_REFRESH_MS * 2).toBeLessThanOrEqual(
      LIVENESS_STALL_THRESHOLD_MS,
    );
  });
});
