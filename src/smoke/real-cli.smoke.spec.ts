import { describe, expect, it } from 'vitest';

const smokeEnabled: boolean = process.env['OMD_SMOKE'] === '1';

describe.runIf(smokeEnabled)('real Devin CLI smoke suite', () => {
  it('runs only when OMD_SMOKE=1 is set', () => {
    expect(smokeEnabled).toBe(true);
  });
});
