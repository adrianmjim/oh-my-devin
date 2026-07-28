import { describe, expect, it } from 'vitest';
import { REWORK_FRAMING } from './rework-framing';

describe('REWORK_FRAMING', () => {
  it('states that a prior attempt was rejected', () => {
    expect(REWORK_FRAMING).toMatch(/prior attempt .* rejected/);
  });

  it('names the findings as the reason and the work to be done', () => {
    expect(REWORK_FRAMING).toContain('review.json');
    expect(REWORK_FRAMING).toMatch(/resolve every one of them/);
  });

  it('points the findings at the conveyed diff rather than the fresh worktree', () => {
    expect(REWORK_FRAMING).toContain('diff');
    expect(REWORK_FRAMING).toMatch(/not to the worktree/);
  });

  it('keeps the architecture governing the approach', () => {
    expect(REWORK_FRAMING).toMatch(/architecture\.json still governs/);
    expect(REWORK_FRAMING).toMatch(/not a licence to redesign it/);
  });

  it('is headed as its own prompt section', () => {
    expect(REWORK_FRAMING.startsWith('## rework\n')).toBe(true);
  });
});
