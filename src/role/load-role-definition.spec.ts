import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { RoleDefinition } from './role-definition';
import { RoleDefinitionError } from './role-definition-error';
import { loadRoleDefinition } from './load-role-definition';

const AGENT_MD: string = [
  '---',
  'omd-output: out.json',
  'omd-schema: out.schema.json',
  'omd-max-turns: 5',
  '---',
  'Do the work.',
].join('\n');

describe('loadRoleDefinition', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-role-'));
    const roleDir: string = join(dir, '.devin', 'agents', 'worker');
    await mkdir(roleDir, { recursive: true });
    await writeFile(join(roleDir, 'AGENT.md'), AGENT_MD, 'utf8');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('loads and parses a role from its fixed location', async () => {
    const role: RoleDefinition = await loadRoleDefinition(dir, 'worker');
    expect(role.name).toBe('worker');
    expect(role.outputArtifact).toBe('out.json');
    expect(role.maxTurns).toBe(5);
  });

  it('throws a RoleDefinitionError when the role file is absent', async () => {
    await expect(loadRoleDefinition(dir, 'ghost')).rejects.toThrow(
      RoleDefinitionError,
    );
  });
});
