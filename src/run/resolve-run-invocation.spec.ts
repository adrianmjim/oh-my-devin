import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ResolvedRunInvocation } from './resolved-run-invocation';
import { resolveRunInvocation } from './resolve-run-invocation';
import { UsageError } from './usage-error';

const SCHEMA = { type: 'object' };

describe('resolveRunInvocation', () => {
  let dir: string;

  async function scaffold(): Promise<void> {
    const roleDir: string = join(dir, '.devin', 'agents', 'reviewer');
    await mkdir(roleDir, { recursive: true });
    const agentMd: string = [
      '---',
      'omd-output: review.json',
      'omd-schema: review.schema.json',
      'omd-max-turns: 8',
      '---',
      'You are the reviewer.',
    ].join('\n');
    await writeFile(join(roleDir, 'AGENT.md'), agentMd, 'utf8');
    await writeFile(join(dir, 'review.schema.json'), JSON.stringify(SCHEMA));
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-resolve-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns the resolved role, schema text and compiled bundle', async () => {
    await scaffold();
    const resolved: ResolvedRunInvocation = await resolveRunInvocation(
      dir,
      'reviewer',
      'assess the diff',
    );
    expect(resolved.role.name).toBe('reviewer');
    expect(JSON.parse(resolved.schemaText)).toEqual(SCHEMA);
    expect(resolved.bundle).toBeDefined();
  });

  it('rejects an empty task as a usage error', async () => {
    await scaffold();
    await expect(resolveRunInvocation(dir, 'reviewer', '   ')).rejects.toThrow(
      UsageError,
    );
  });

  it('rejects an unresolvable role as a usage error', async () => {
    await scaffold();
    await expect(
      resolveRunInvocation(dir, 'ghost', 'assess the diff'),
    ).rejects.toThrow(UsageError);
  });

  it('rejects a role whose declared schema file is missing', async () => {
    await scaffold();
    await rm(join(dir, 'review.schema.json'), { force: true });
    await expect(
      resolveRunInvocation(dir, 'reviewer', 'assess the diff'),
    ).rejects.toThrow(UsageError);
  });
});
