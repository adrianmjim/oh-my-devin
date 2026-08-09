import { describe, expect, it } from 'vitest';
import { MODE_LOCK_STALE_MS } from './mode-lock-stale-ms';

describe('MODE_LOCK_STALE_MS', () => {
  it('is a positive duration in milliseconds', () => {
    expect(typeof MODE_LOCK_STALE_MS).toBe('number');
    expect(MODE_LOCK_STALE_MS).toBeGreaterThan(0);
  });

  it('outlasts any serialized mode operation', () => {
    expect(MODE_LOCK_STALE_MS).toBeGreaterThanOrEqual(1000);
  });
});
