import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ROLES_RELATIVE_DIR } from '../role/roles-relative-dir';
import { discoveryRoots } from './discovery-roots';

describe('discoveryRoots', () => {
  it('searches the project layer', () => {
    expect(discoveryRoots({ projectDir: '/p', userConfigDir: null })).toEqual([
      join('/p', ROLES_RELATIVE_DIR),
    ]);
  });

  it('adds the user-level layer when one is configured', () => {
    const roots: readonly string[] = discoveryRoots({
      projectDir: '/p',
      userConfigDir: '/u',
    });

    expect(roots).toHaveLength(2);
    expect(roots[0]).toContain('/p');
    expect(roots[1]).toContain('/u');
  });
});
