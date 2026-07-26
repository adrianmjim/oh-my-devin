import { describe, expect, it } from 'vitest';
import { ALL_INSTALL_LEVELS } from './all-install-levels';
import { isInstallLevel } from './is-install-level';

describe('ALL_INSTALL_LEVELS', () => {
  it('enumerates every install level', () => {
    expect(ALL_INSTALL_LEVELS).toEqual(['project', 'user']);
  });

  it('holds only recognized levels', () => {
    for (const level of ALL_INSTALL_LEVELS) {
      expect(isInstallLevel(level)).toBe(true);
    }
  });
});
