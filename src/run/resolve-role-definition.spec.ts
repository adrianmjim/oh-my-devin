import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { resolveRoleDefinition } from './resolve-role-definition';
import { UsageError } from './usage-error';

describe('resolveRoleDefinition', () => {
  let projectDir: string;
  let lookup: LayerLookup;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-resolve-role-'));
    lookup = { projectDir, userConfigDir: null };
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('resolves a declared role', async () => {
    const roleDir: string = join(projectDir, '.devin', 'agents', 'worker');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      [
        '---',
        'omd-output: out.json',
        'omd-schema: out.schema.json',
        'omd-max-turns: 5',
        '---',
        'Do the work.',
      ].join('\n'),
      'utf8',
    );

    expect((await resolveRoleDefinition(lookup, 'worker')).role.name).toBe(
      'worker',
    );
  });

  it('reports an unresolvable role as a usage error', async () => {
    await expect(resolveRoleDefinition(lookup, 'ghost')).rejects.toThrow(
      UsageError,
    );
  });
});
