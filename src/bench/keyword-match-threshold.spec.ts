import { describe, expect, it } from 'vitest';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';

describe('KEYWORD_MATCH_THRESHOLD', () => {
  it('pins the fraction of an item keyword set a pairing must carry', () => {
    expect(KEYWORD_MATCH_THRESHOLD).toBe(0.6);
  });

  it('sits strictly inside the unit interval', () => {
    expect(KEYWORD_MATCH_THRESHOLD).toBeGreaterThan(0);
    expect(KEYWORD_MATCH_THRESHOLD).toBeLessThanOrEqual(1);
  });
});
