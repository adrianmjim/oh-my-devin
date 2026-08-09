import { describe, expect, it } from 'vitest';
import { MODE_STALENESS_THRESHOLD_MS } from './mode-staleness-threshold-ms';

describe('MODE_STALENESS_THRESHOLD_MS', () => {
  it('is a positive duration in milliseconds', () => {
    expect(typeof MODE_STALENESS_THRESHOLD_MS).toBe('number');
    expect(MODE_STALENESS_THRESHOLD_MS).toBeGreaterThan(0);
  });

  it('outlasts a human pause between hook events', () => {
    expect(MODE_STALENESS_THRESHOLD_MS).toBeGreaterThanOrEqual(600000);
  });
});
