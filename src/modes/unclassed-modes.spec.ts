import { describe, expect, it } from 'vitest';
import { EXCLUSIVE_MODES } from './exclusive-modes';
import { UNCLASSED_MODES } from './unclassed-modes';

describe('UNCLASSED_MODES', () => {
  it('holds the support modes that compose freely', () => {
    expect(UNCLASSED_MODES).toEqual(['plan', 'verify']);
  });

  it('shares no member with the exclusive class', () => {
    for (const mode of UNCLASSED_MODES) {
      expect(EXCLUSIVE_MODES).not.toContain(mode);
    }
  });
});
