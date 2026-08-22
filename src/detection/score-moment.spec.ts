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

  it('scores a marker carried only inside a longer word at zero', () => {
    expect(
      scoreMoment('whenever the build runs the cache is warmed first'),
    ).toBe(0);
    expect(
      scoreMoment('nevertheless the old parser stays in place for now'),
    ).toBe(0);
    expect(scoreMoment('we do nothing special for the staging cluster')).toBe(
      0,
    );
  });

  it('scores the inflected forms a preference is stated with', () => {
    expect(
      scoreMoment('the team prefers tabs over spaces in every file'),
    ).toBeGreaterThanOrEqual(QUALITY_GATE_THRESHOLD);
    expect(
      scoreMoment('the preferred branch name carries the ticket number'),
    ).toBeGreaterThanOrEqual(QUALITY_GATE_THRESHOLD);
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
