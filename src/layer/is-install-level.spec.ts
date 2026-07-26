import { describe, expect, it } from 'vitest';
import { isInstallLevel } from './is-install-level';

describe('isInstallLevel', () => {
  it('accepts the two install levels', () => {
    expect(isInstallLevel('project')).toBe(true);
    expect(isInstallLevel('user')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isInstallLevel('global')).toBe(false);
    expect(isInstallLevel(null)).toBe(false);
  });
});
