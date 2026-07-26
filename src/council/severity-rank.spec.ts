import { describe, expect, it } from 'vitest';
import { severityRank } from './severity-rank';

describe('severityRank', () => {
  it('ranks low below critical', () => {
    expect(severityRank('low')).toBeLessThan(severityRank('critical'));
  });

  it('ranks the severities in ascending order', () => {
    expect([
      severityRank('low'),
      severityRank('medium'),
      severityRank('high'),
      severityRank('critical'),
    ]).toEqual([0, 1, 2, 3]);
  });
});
