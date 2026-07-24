import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildPluginBundle } from './build-plugin-bundle';
import type { PluginBundleResult } from './plugin-bundle-result';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('plugin bundle team-declaration exclusion', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-plugin-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('bundles no team declarations', async () => {
    const result: PluginBundleResult = await buildPluginBundle(dir);

    for (const path of result.writtenPaths) {
      expect(path.endsWith('.yaml'), path).toBe(false);
      expect(path.includes('teams'), path).toBe(false);
    }
    expect(await exists(join(dir, '.devin', 'teams'))).toBe(false);
    expect(await exists(join(dir, 'teams'))).toBe(false);
  });
});
