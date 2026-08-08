import { describe, expect, it } from 'vitest';
import { QUALITY_GATE_THRESHOLD } from './quality-gate-threshold';
import { scoreMoment } from './score-moment';

describe('scoreMoment', () => {
  it('scores a specific directive above the gate', () => {
    expect(
      scoreMoment('always run the linter before pushing to main'),
    ).toBeGreaterThanOrEqual(QUALITY_GATE_THRESHOLD);
  });

  it('scores a directive too terse to be reusable below the gate', () => {
    expect(scoreMoment('always lint')).toBeLessThan(QUALITY_GATE_THRESHOLD);
  });

  it('scores text carrying no directive at zero', () => {
    expect(scoreMoment('why did the linter fail on that branch')).toBe(0);
  });

  it('keeps every score inside the unit interval', () => {
    const scores: readonly number[] = [
      'always never remember from now on make sure to prefer this over that in every case without exception',
      'never',
      '',
    ].map(scoreMoment);

    for (const score of scores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});
