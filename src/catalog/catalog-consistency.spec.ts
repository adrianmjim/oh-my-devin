import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { loadRoleDefinition } from '../role/load-role-definition';
import type { ResolvedRoleDefinition } from '../role/resolved-role-definition';
import { RoleDefinitionError } from '../role/role-definition-error';
import type { RoleDefinition } from '../role/role-definition';
import type { RoleDiscovery } from './role-discovery';
import type { RoleDiscoveryError } from './role-discovery-error';
import { discoverRoles } from './discover-roles';

function agentMd(artifact: string): string {
  return [
    '---',
    `omd-output: ${artifact}`,
    `omd-schema: ${artifact}.schema.json`,
    'omd-max-turns: 4',
    '---',
    'Do the work.',
  ].join('\n');
}

describe('catalog and role loading consistency', () => {
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
    dir = await mkdtemp(join(tmpdir(), 'omd-consistency-'));
    userConfigDir = await mkdtemp(join(tmpdir(), 'omd-consistency-user-'));
    lookup = { projectDir: dir, userConfigDir };
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
    await rm(userConfigDir, { recursive: true, force: true });
  });

  it('loads every discovered role and rejects only the malformed one', async () => {
    await writeRole('architect', agentMd('design.json'));
    await writeRole('reviewer', agentMd('review.json'));
    await writeRole('tester', agentMd('tests.json'));
    await writeRole('broken', '---\nomd-output: out.json\n---\nbody');

    const discovery: RoleDiscovery = await discoverRoles(lookup);

    expect(
      discovery.roles.map((role: RoleDefinition): string => role.name),
    ).toEqual(['architect', 'reviewer', 'tester']);
    for (const discovered of discovery.roles) {
      const loaded: ResolvedRoleDefinition = await loadRoleDefinition(
        lookup,
        discovered.name,
      );
      expect(loaded.role).toEqual(discovered);
    }
    expect(
      discovery.errors.map((error: RoleDiscoveryError): string => error.name),
    ).toEqual(['broken']);
    await expect(loadRoleDefinition(lookup, 'broken')).rejects.toThrow(
      RoleDefinitionError,
    );
  });

  it('loads every role discovered only at user level', async () => {
    await writeRole('architect', agentMd('design.json'));
    await writeUserRole('reviewer', agentMd('review.json'));

    const discovery: RoleDiscovery = await discoverRoles(lookup);

    expect(
      discovery.roles.map((role: RoleDefinition): string => role.name),
    ).toEqual(['architect', 'reviewer']);
    for (const discovered of discovery.roles) {
      const loaded: ResolvedRoleDefinition = await loadRoleDefinition(
        lookup,
        discovered.name,
      );
      expect(loaded.role).toEqual(discovered);
    }
  });
});
