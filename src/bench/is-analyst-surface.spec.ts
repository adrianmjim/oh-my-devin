import { describe, expect, it } from 'vitest';
import { isAnalystSurface } from './is-analyst-surface';

describe('isAnalystSurface', () => {
  it('accepts the four lists an analysis surfaces a gap in', () => {
    expect(isAnalystSurface('criterion')).toBe(true);
    expect(isAnalystSurface('question')).toBe(true);
    expect(isAnalystSurface('assumption')).toBe(true);
    expect(isAnalystSurface('risk')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isAnalystSurface('note')).toBe(false);
    expect(isAnalystSurface(null)).toBe(false);
  });
});
