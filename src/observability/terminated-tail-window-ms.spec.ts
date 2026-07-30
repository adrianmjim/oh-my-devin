import { describe, expect, it } from 'vitest';
import { LIVENESS_STALL_THRESHOLD_MS } from './liveness-stall-threshold-ms';
import { TERMINATED_TAIL_WINDOW_MS } from './terminated-tail-window-ms';

describe('TERMINATED_TAIL_WINDOW_MS', () => {
  it('declares a recency window on the order of hours', () => {
    expect(TERMINATED_TAIL_WINDOW_MS).toBeGreaterThanOrEqual(3600000);
  });

  it('outlives the stall threshold so a run that just died stays visible', () => {
    expect(TERMINATED_TAIL_WINDOW_MS).toBeGreaterThan(
      LIVENESS_STALL_THRESHOLD_MS,
    );
  });
});
