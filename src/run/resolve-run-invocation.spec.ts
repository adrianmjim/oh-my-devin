import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { resolveRunInvocation } from './resolve-run-invocation';
import type { ResolvedRunInvocation } from './resolved-run-invocation';
import { UsageError } from './usage-error';

const SCHEMA = { type: 'object' };

function agentMd(schemaRef: string): string {
  return [
    '---',
    'omd-output: review.json',
    `omd-schema: ${schemaRef}`,
    'omd-max-turns: 8',
    '---',
    'You are the reviewer.',
  ].join('\n');
}

describe('resolveRunInvocation', () => {
  let projectDir: string;
  let userConfigDir: string;
  let lookup: LayerLookup;

  async function scaffold(): Promise<void> {
    const roleDir: string = join(projectDir, '.devin', 'agents', 'reviewer');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      agentMd('review.schema.json'),
      'utf8',
    );
    await writeFile(
      join(projectDir, 'review.schema.json'),
      JSON.stringify(SCHEMA),
    );
  }

  async function scaffoldUserLevel(): Promise<void> {
    const roleDir: string = join(userConfigDir, 'agents', 'reviewer');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      agentMd(join('.devin', 'schemas', 'review.schema.json')),
      'utf8',
    );
    await mkdir(join(userConfigDir, 'schemas'), { recursive: true });
    await writeFile(
      join(userConfigDir, 'schemas', 'review.schema.json'),
      JSON.stringify(SCHEMA),
    );
  }

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-resolve-'));
    userConfigDir = await mkdtemp(join(tmpdir(), 'omd-resolve-user-'));
    lookup = { projectDir, userConfigDir };
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
    await rm(userConfigDir, { recursive: true, force: true });
  });

  it('returns the resolved role, schema text and compiled bundle', async () => {
    await scaffold();
    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
    );
    expect(resolved.role.name).toBe('reviewer');
    expect(JSON.parse(resolved.schemaText)).toEqual(SCHEMA);
    expect(resolved.bundle).toBeDefined();
  });

  it('publishes the project-level schema path it resolved', async () => {
    await scaffold();
    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
    );
    expect(resolved.schemaPath).toBe(join(projectDir, 'review.schema.json'));
  });

  it('resolves a role installed only at user level, with its user-level schema', async () => {
    await scaffoldUserLevel();

    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      lookup,
      'reviewer',
      'assess the diff',
    );

    expect(resolved.role.name).toBe('reviewer');
    expect(resolved.schemaPath).toBe(
      join(userConfigDir, 'schemas', 'review.schema.json'),
    );
    expect(JSON.parse(resolved.schemaText)).toEqual(SCHEMA);
  });

  it('rejects an empty task as a usage error', async () => {
    await scaffold();
    await expect(
      resolveRunInvocation(lookup, 'reviewer', '   '),
    ).rejects.toThrow(UsageError);
  });

  it('rejects an unresolvable role as a usage error', async () => {
    await scaffold();
    await expect(
      resolveRunInvocation(lookup, 'ghost', 'assess the diff'),
    ).rejects.toThrow(UsageError);
  });

  it('rejects a role whose declared schema file is missing', async () => {
    await scaffold();
    await rm(join(projectDir, 'review.schema.json'), { force: true });
    await expect(
      resolveRunInvocation(lookup, 'reviewer', 'assess the diff'),
    ).rejects.toThrow(UsageError);
  });
});
