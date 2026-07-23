import { describe, expect, it } from 'vitest';
import {
  LIVENESS_REFRESH_MS,
  LIVENESS_STALL_THRESHOLD_MS,
} from './liveness-timing';

describe('liveness timing constants', () => {
  it('refreshes on a tens-of-seconds cadence', () => {
    expect(LIVENESS_REFRESH_MS).toBeGreaterThanOrEqual(1000);
    expect(LIVENESS_REFRESH_MS).toBeLessThan(60000);
  });

  it('declares a stall threshold on the order of minutes', () => {
    expect(LIVENESS_STALL_THRESHOLD_MS).toBeGreaterThanOrEqual(60000);
  });

  it('keeps the refresh cadence well under the stall threshold', () => {
    expect(LIVENESS_REFRESH_MS * 2).toBeLessThanOrEqual(
      LIVENESS_STALL_THRESHOLD_MS,
    );
  });
});
