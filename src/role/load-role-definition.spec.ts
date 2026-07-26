import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { loadRoleDefinition } from './load-role-definition';
import type { ResolvedRoleDefinition } from './resolved-role-definition';
import { RoleDefinitionError } from './role-definition-error';

function agentMd(output: string): string {
  return [
    '---',
    `omd-output: ${output}`,
    'omd-schema: out.schema.json',
    'omd-max-turns: 5',
    '---',
    'Do the work.',
  ].join('\n');
}

async function writeRole(roleDir: string, output: string): Promise<void> {
  await mkdir(roleDir, { recursive: true });
  await writeFile(join(roleDir, 'AGENT.md'), agentMd(output), 'utf8');
}

describe('loadRoleDefinition', () => {
  let projectDir: string;
  let userConfigDir: string;
  let lookup: LayerLookup;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-role-project-'));
    userConfigDir = await mkdtemp(join(tmpdir(), 'omd-role-user-'));
    lookup = { projectDir, userConfigDir };
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
    await rm(userConfigDir, { recursive: true, force: true });
  });

  it('loads and parses a project role from its fixed location', async () => {
    await writeRole(join(projectDir, '.devin', 'agents', 'worker'), 'out.json');

    const resolved: ResolvedRoleDefinition = await loadRoleDefinition(
      lookup,
      'worker',
    );

    expect(resolved.role.name).toBe('worker');
    expect(resolved.role.outputArtifact).toBe('out.json');
    expect(resolved.role.maxTurns).toBe(5);
    expect(resolved.candidate.level).toBe('project');
  });

  it('falls back to the user-level definition when the project has none', async () => {
    await writeRole(join(userConfigDir, 'agents', 'worker'), 'user.json');

    const resolved: ResolvedRoleDefinition = await loadRoleDefinition(
      lookup,
      'worker',
    );

    expect(resolved.role.outputArtifact).toBe('user.json');
    expect(resolved.candidate.level).toBe('user');
    expect(resolved.candidate.baseDir).toBe(userConfigDir);
  });

  it('prefers the project definition over a user-level one of the same name', async () => {
    await writeRole(
      join(projectDir, '.devin', 'agents', 'worker'),
      'project.json',
    );
    await writeRole(join(userConfigDir, 'agents', 'worker'), 'user.json');

    const resolved: ResolvedRoleDefinition = await loadRoleDefinition(
      lookup,
      'worker',
    );

    expect(resolved.role.outputArtifact).toBe('project.json');
    expect(resolved.candidate.level).toBe('project');
  });

  it('throws a RoleDefinitionError when the role file is absent', async () => {
    await expect(loadRoleDefinition(lookup, 'ghost')).rejects.toThrow(
      RoleDefinitionError,
    );
  });

  it('names every path it tried when the role is absent at both levels', async () => {
    await expect(loadRoleDefinition(lookup, 'ghost')).rejects.toThrow(
      join(projectDir, '.devin', 'agents', 'ghost', 'AGENT.md'),
    );
    await expect(loadRoleDefinition(lookup, 'ghost')).rejects.toThrow(
      join(userConfigDir, 'agents', 'ghost', 'AGENT.md'),
    );
  });

  it('names only the project path when no user-level directory is known', async () => {
    const projectOnly: LayerLookup = { projectDir, userConfigDir: null };

    await expect(loadRoleDefinition(projectOnly, 'ghost')).rejects.toThrow(
      join(projectDir, '.devin', 'agents', 'ghost', 'AGENT.md'),
    );
    await expect(loadRoleDefinition(projectOnly, 'ghost')).rejects.not.toThrow(
      userConfigDir,
    );
  });
});
