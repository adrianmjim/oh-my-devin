import { describe, expect, it } from 'vitest';
import { MODE_LOCK_STALE_MS } from './mode-lock-stale-ms';
import { MODE_LOCK_WAIT_MS } from './mode-lock-wait-ms';

describe('MODE_LOCK_WAIT_MS', () => {
  it('is a positive duration in milliseconds', () => {
    expect(typeof MODE_LOCK_WAIT_MS).toBe('number');
    expect(MODE_LOCK_WAIT_MS).toBeGreaterThan(0);
  });

  it('gives up before a healthy holder reads as abandoned', () => {
    expect(MODE_LOCK_WAIT_MS).toBeLessThan(MODE_LOCK_STALE_MS);
  });
});
