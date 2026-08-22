import { describe, expect, it } from 'vitest';
import { DETECTION_LOCK_STALE_MS } from './detection-lock-stale-ms';
import { DETECTION_LOCK_WAIT_MS } from './detection-lock-wait-ms';

describe('DETECTION_LOCK_WAIT_MS', () => {
  it('is a positive duration in milliseconds', () => {
    expect(typeof DETECTION_LOCK_WAIT_MS).toBe('number');
    expect(DETECTION_LOCK_WAIT_MS).toBeGreaterThan(0);
  });

  it('gives up before a healthy holder reads as abandoned', () => {
    expect(DETECTION_LOCK_WAIT_MS).toBeLessThan(DETECTION_LOCK_STALE_MS);
  });
});
