import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { UsageError } from '../run/usage-error';
import { resolveRole } from './resolve-role';

describe('resolveRole', () => {
  let projectDir: string;
  let lookup: LayerLookup;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-cli-role-'));
    lookup = { projectDir, userConfigDir: null };
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('yields the parsed definition of a declared role', async () => {
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

    expect((await resolveRole(lookup, 'worker')).name).toBe('worker');
  });

  it('reports an unknown role as a usage error', async () => {
    await expect(resolveRole(lookup, 'ghost')).rejects.toThrow(UsageError);
  });

  it('keeps the underlying failure in the usage error message', async () => {
    await expect(resolveRole(lookup, 'ghost')).rejects.toThrow(/ghost/);
  });
});
