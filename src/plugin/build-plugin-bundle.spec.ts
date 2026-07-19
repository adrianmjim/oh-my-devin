import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { PluginBundleResult } from './plugin-bundle-result';
import { buildPluginBundle } from './build-plugin-bundle';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('buildPluginBundle', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-plugin-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('bundles the rules file, the delegation skill, and the six mode skills', async () => {
    const result: PluginBundleResult = await buildPluginBundle(dir);

    expect(await exists(join(dir, 'AGENTS.md'))).toBe(true);
    expect(await exists(join(dir, 'skills', 'omd-delegate', 'SKILL.md'))).toBe(
      true,
    );
    for (const skill of MODE_CATALOG) {
      expect(await exists(join(dir, 'skills', skill.name, 'SKILL.md'))).toBe(
        true,
      );
    }
    expect(result.writtenPaths.length).toBe(3 + MODE_CATALOG.length);
  });

  it('writes the .devin-plugin manifest naming the plugin', async () => {
    await buildPluginBundle(dir);

    const manifest: string = await readFile(
      join(dir, '.devin-plugin', 'plugin.json'),
      'utf8',
    );
    expect(JSON.parse(manifest)).toStrictEqual({ name: 'oh-my-devin' });
  });

  it('writes exactly the manifest, the rules file, and the skills', async () => {
    const result: PluginBundleResult = await buildPluginBundle(dir);

    const expected: readonly string[] = [
      join('.devin-plugin', 'plugin.json'),
      'AGENTS.md',
      join('skills', 'omd-delegate', 'SKILL.md'),
      ...MODE_CATALOG.map((skill) => join('skills', skill.name, 'SKILL.md')),
    ];
    expect([...result.writtenPaths].sort()).toEqual([...expected].sort());
  });

  it('bundles no hooks, subagents, or project roles', async () => {
    await buildPluginBundle(dir);

    expect(await exists(join(dir, '.devin', 'hooks.v1.json'))).toBe(false);
    expect(await exists(join(dir, '.devin', 'agents'))).toBe(false);
    expect(await exists(join(dir, '.devin', 'schemas'))).toBe(false);
    expect(await exists(join(dir, 'hooks'))).toBe(false);
    expect(await exists(join(dir, 'agents'))).toBe(false);
    expect(await exists(join(dir, 'roles'))).toBe(false);
  });
});
