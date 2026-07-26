import { describe, expect, it } from 'vitest';
import { ALL_INSTALL_LEVELS, isInstallLevel } from './install-level';

describe('install level', () => {
  it('recognizes the two valid levels', () => {
    expect(isInstallLevel('project')).toBe(true);
    expect(isInstallLevel('user')).toBe(true);
  });

  it('rejects anything that is not a valid level', () => {
    expect(isInstallLevel('global')).toBe(false);
    expect(isInstallLevel('')).toBe(false);
    expect(isInstallLevel('Project')).toBe(false);
    expect(isInstallLevel(42)).toBe(false);
    expect(isInstallLevel(null)).toBe(false);
    expect(isInstallLevel(undefined)).toBe(false);
  });

  it('enumerates project before user', () => {
    expect(ALL_INSTALL_LEVELS).toEqual(['project', 'user']);
  });
});
