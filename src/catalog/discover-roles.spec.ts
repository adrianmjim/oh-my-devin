import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscovery } from './role-discovery';
import { discoverRoles } from './discover-roles';

function agentMd(maxTurns: number): string {
  return [
    '---',
    'omd-output: out.json',
    'omd-schema: out.schema.json',
    `omd-max-turns: ${maxTurns}`,
    '---',
    'Do the work.',
  ].join('\n');
}

function namesOf(discovery: RoleDiscovery): readonly string[] {
  return discovery.roles.map((role: RoleDefinition): string => role.name);
}

describe('discoverRoles', () => {
  let dir: string;
  let userConfigDir: string;
  let lookup: LayerLookup;

  async function writeRole(name: string, body: string): Promise<void> {
    const roleDir: string = join(dir, '.devin', 'agents', name);
    await mkdir(roleDir, { recursive: true });
    await writeFile(join(roleDir, 'AGENT.md'), body, 'utf8');
  }

  async function writeUserRole(name: string, body: string): Promise<void> {
    const roleDir: string = join(userConfigDir, 'agents', name);
    await mkdir(roleDir, { recursive: true });
    await writeFile(join(roleDir, 'AGENT.md'), body, 'utf8');
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-catalog-'));
    userConfigDir = await mkdtemp(join(tmpdir(), 'omd-catalog-user-'));
    lookup = { projectDir: dir, userConfigDir };
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(userConfigDir, { recursive: true, force: true });
  });

  it('returns an empty discovery when no agents directory exists', async () => {
    const discovery: RoleDiscovery = await discoverRoles(lookup);
    expect(discovery.roles).toEqual([]);
    expect(discovery.errors).toEqual([]);
  });

  it('discovers well-formed roles and reports malformed ones separately', async () => {
    await writeRole('reviewer', agentMd(8));
    await writeRole('architect', agentMd(5));
    await writeRole('broken', '---\nnot: valid\n---\nbody');

    const discovery: RoleDiscovery = await discoverRoles(lookup);

    expect(namesOf(discovery)).toEqual(['architect', 'reviewer']);
    expect(discovery.errors.map((e) => e.name)).toEqual(['broken']);
  });

  it('lists user-level roles when the project has none of its own', async () => {
    await writeUserRole('reviewer', agentMd(8));
    await writeUserRole('architect', agentMd(5));

    const discovery: RoleDiscovery = await discoverRoles(lookup);

    expect(namesOf(discovery)).toEqual(['architect', 'reviewer']);
  });

  it('lists the union of both levels', async () => {
    await writeRole('reviewer', agentMd(8));
    await writeUserRole('architect', agentMd(5));

    const discovery: RoleDiscovery = await discoverRoles(lookup);

    expect(namesOf(discovery)).toEqual(['architect', 'reviewer']);
  });

  it('lists a shadowed role once, with the project definition', async () => {
    await writeRole('reviewer', agentMd(8));
    await writeUserRole('reviewer', agentMd(5));

    const discovery: RoleDiscovery = await discoverRoles(lookup);

    expect(namesOf(discovery)).toEqual(['reviewer']);
    expect(discovery.roles[0]?.maxTurns).toBe(8);
  });

  it('keeps project roles when no user-level directory is known', async () => {
    await writeRole('reviewer', agentMd(8));

    const discovery: RoleDiscovery = await discoverRoles({
      projectDir: dir,
      userConfigDir: null,
    });

    expect(namesOf(discovery)).toEqual(['reviewer']);
  });

  it('keeps project roles when the user-level directory is absent', async () => {
    await writeRole('reviewer', agentMd(8));
    await rm(userConfigDir, { recursive: true, force: true });

    const discovery: RoleDiscovery = await discoverRoles(lookup);

    expect(namesOf(discovery)).toEqual(['reviewer']);
  });
});
