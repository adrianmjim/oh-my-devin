import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveUserConfigDir } from './resolve-user-config-dir';

describe('resolveUserConfigDir', () => {
  it('honors XDG_CONFIG_HOME when set', () => {
    expect(resolveUserConfigDir('/x/cfg', '/home/u')).toBe(
      join('/x/cfg', 'devin'),
    );
  });

  it('falls back to ~/.config when XDG_CONFIG_HOME is unset', () => {
    expect(resolveUserConfigDir(undefined, '/home/u')).toBe(
      join('/home/u', '.config', 'devin'),
    );
  });

  it('treats an empty XDG_CONFIG_HOME as unset', () => {
    expect(resolveUserConfigDir('', '/home/u')).toBe(
      join('/home/u', '.config', 'devin'),
    );
  });
});
