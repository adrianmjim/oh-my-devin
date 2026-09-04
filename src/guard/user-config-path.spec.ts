import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveUserConfigDir } from '../layer/resolve-user-config-dir';
import { userConfigPath } from './user-config-path';

describe('userConfigPath', () => {
  it('places the user configuration under omd in the XDG config base', () => {
    expect(userConfigPath(resolveUserConfigDir('/xdg', '/home/user'))).toBe(
      join('/xdg', 'omd', 'config.yaml'),
    );
  });

  it('follows the layer to the home config base when XDG is unset', () => {
    const expected: string = join(
      '/home/user',
      '.config',
      'omd',
      'config.yaml',
    );

    expect(userConfigPath(resolveUserConfigDir(undefined, '/home/user'))).toBe(
      expected,
    );
    expect(
      userConfigPath(resolveUserConfigDir('relative/dir', '/home/user')),
    ).toBe(expected);
  });

  it('keeps omd out of the engine configuration namespace', () => {
    const engineDir: string = resolveUserConfigDir('/xdg', '/home/user');

    expect(userConfigPath(engineDir).startsWith(engineDir)).toBe(false);
  });
});
