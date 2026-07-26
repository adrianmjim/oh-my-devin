import { describe, expect, it } from 'vitest';
import { isTeamStrategy } from './is-team-strategy';

describe('isTeamStrategy', () => {
  it('accepts the two multi-instance strategies', () => {
    expect(isTeamStrategy('parallel')).toBe(true);
    expect(isTeamStrategy('independent')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isTeamStrategy('sequential')).toBe(false);
    expect(isTeamStrategy(null)).toBe(false);
  });
});
