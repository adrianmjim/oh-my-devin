import { describe, expect, it } from 'vitest';
import { LIVENESS_REFRESH_MS } from './liveness-refresh-ms';

describe('LIVENESS_REFRESH_MS', () => {
  it('refreshes on a tens-of-seconds cadence', () => {
    expect(LIVENESS_REFRESH_MS).toBeGreaterThanOrEqual(1000);
    expect(LIVENESS_REFRESH_MS).toBeLessThan(60000);
  });
});
