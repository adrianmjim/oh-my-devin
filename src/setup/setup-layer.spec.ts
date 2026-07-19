import { access, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { discoverRoles } from '../catalog/discover-roles';
import type { RoleDiscovery } from '../catalog/role-discovery';
import { MODE_CATALOG } from '../modes/mode-catalog';
import type { SetupResult } from './setup-result';
import { setupLayer } from './setup-layer';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('setupLayer', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-setup-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('installs every layer component in a single invocation', async () => {
    const result: SetupResult = await setupLayer(dir);

    expect(await exists(join(dir, 'AGENTS.md'))).toBe(true);
    expect(
      await exists(join(dir, '.devin', 'agents', 'reviewer', 'AGENT.md')),
    ).toBe(true);
    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(true);
    expect(await exists(join(dir, '.devin', 'hooks.v1.json'))).toBe(true);
    expect(result.writtenPaths.length).toBeGreaterThanOrEqual(4);
  });

  it('installs an example role that the catalog can discover cleanly', async () => {
    await setupLayer(dir);

    const discovery: RoleDiscovery = await discoverRoles(dir);
    expect(discovery.errors).toEqual([]);
    expect(discovery.roles.map((r) => r.name)).toContain('reviewer');
  });

  it('installs a model-triggered delegation skill that invokes omd run', async () => {
    await setupLayer(dir);

    const skill: string = await readFile(
      join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      'utf8',
    );
    expect(skill).toContain('omd run');
    expect(skill).toContain('model');
  });

  it('installs all six mode skills from the catalog', async () => {
    await setupLayer(dir);

    for (const skill of MODE_CATALOG) {
      expect(
        await exists(join(dir, '.devin', 'skills', skill.name, 'SKILL.md')),
      ).toBe(true);
    }
  });

  it('installs only the hooks when scoped to hooks', async () => {
    await setupLayer(dir, ['hooks']);

    expect(await exists(join(dir, '.devin', 'hooks.v1.json'))).toBe(true);
    expect(await exists(join(dir, '.devin', 'hooks', 'omd-mode.mjs'))).toBe(
      true,
    );
    expect(await exists(join(dir, 'AGENTS.md'))).toBe(false);
    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(false);
    expect(
      await exists(join(dir, '.devin', 'agents', 'reviewer', 'AGENT.md')),
    ).toBe(false);
  });

  it('installs only the skills when scoped to skills', async () => {
    await setupLayer(dir, ['skills']);

    expect(
      await exists(join(dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(true);
    for (const skill of MODE_CATALOG) {
      expect(
        await exists(join(dir, '.devin', 'skills', skill.name, 'SKILL.md')),
      ).toBe(true);
    }
    expect(await exists(join(dir, 'AGENTS.md'))).toBe(false);
    expect(await exists(join(dir, '.devin', 'hooks.v1.json'))).toBe(false);
  });

  it('writes a hooks event map that is valid JSON', async () => {
    await setupLayer(dir);

    const hooks: string = await readFile(
      join(dir, '.devin', 'hooks.v1.json'),
      'utf8',
    );
    const parsed: unknown = JSON.parse(hooks);
    expect(parsed).toHaveProperty('SessionStart');
    expect(parsed).toHaveProperty('Stop');
  });
});
