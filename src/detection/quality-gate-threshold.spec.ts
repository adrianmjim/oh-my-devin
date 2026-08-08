import { describe, expect, it } from 'vitest';
import { QUALITY_GATE_THRESHOLD } from './quality-gate-threshold';

describe('QUALITY_GATE_THRESHOLD', () => {
  it('is an omd-owned score every candidate must reach', () => {
    expect(typeof QUALITY_GATE_THRESHOLD).toBe('number');
    expect(QUALITY_GATE_THRESHOLD).toBeGreaterThan(0);
    expect(QUALITY_GATE_THRESHOLD).toBeLessThanOrEqual(1);
  });
});
