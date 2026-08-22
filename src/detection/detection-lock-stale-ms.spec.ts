import { describe, expect, it } from 'vitest';
import { DETECTION_LOCK_STALE_MS } from './detection-lock-stale-ms';

describe('DETECTION_LOCK_STALE_MS', () => {
  it('is a positive duration in milliseconds', () => {
    expect(typeof DETECTION_LOCK_STALE_MS).toBe('number');
    expect(DETECTION_LOCK_STALE_MS).toBeGreaterThan(0);
  });
});
