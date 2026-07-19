import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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

describe('discoverRoles', () => {
  let dir: string;

  async function writeRole(name: string, body: string): Promise<void> {
    const roleDir: string = join(dir, '.devin', 'agents', name);
    await mkdir(roleDir, { recursive: true });
    await writeFile(join(roleDir, 'AGENT.md'), body, 'utf8');
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-catalog-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns an empty discovery when no agents directory exists', async () => {
    const discovery: RoleDiscovery = await discoverRoles(dir);
    expect(discovery.roles).toEqual([]);
    expect(discovery.errors).toEqual([]);
  });

  it('discovers well-formed roles and reports malformed ones separately', async () => {
    await writeRole('reviewer', agentMd(8));
    await writeRole('architect', agentMd(5));
    await writeRole('broken', '---\nnot: valid\n---\nbody');

    const discovery: RoleDiscovery = await discoverRoles(dir);

    expect(discovery.roles.map((r: RoleDefinition): string => r.name)).toEqual([
      'architect',
      'reviewer',
    ]);
    expect(discovery.errors.map((e) => e.name)).toEqual(['broken']);
  });
});
