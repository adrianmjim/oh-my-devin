import { describe, expect, it } from 'vitest';
import { EXCLUSIVE_MODES } from './exclusive-modes';
import { STATELESS_MODES } from './stateless-modes';
import { UNCLASSED_MODES } from './unclassed-modes';

describe('STATELESS_MODES', () => {
  it('holds the modes that record no mode state', () => {
    expect(STATELESS_MODES).toEqual(['deep-dive']);
  });

  it('shares no member with the classed modes', () => {
    for (const mode of STATELESS_MODES) {
      expect(EXCLUSIVE_MODES).not.toContain(mode);
      expect(UNCLASSED_MODES).not.toContain(mode);
    }
  });
});
