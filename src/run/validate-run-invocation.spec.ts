import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { LayerLookup } from '../layer/layer-lookup';
import { UsageError } from './usage-error';
import { validateRunInvocation } from './validate-run-invocation';

const SCHEMA = { type: 'object' };

describe('validateRunInvocation', () => {
  let dir: string;
  let lookup: LayerLookup;

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
    dir = await mkdtemp(join(tmpdir(), 'omd-validate-'));
    lookup = { projectDir: dir, userConfigDir: null };
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('resolves without throwing for a defined role and a non-empty task', async () => {
    await scaffold();
    await expect(
      validateRunInvocation(lookup, 'reviewer', 'assess the diff', {
        workingDirectory: dir,
        provisionedWorktree: false,
      }),
    ).resolves.toBeUndefined();
  });

  it('rejects an empty task as a usage error', async () => {
    await scaffold();
    await expect(
      validateRunInvocation(lookup, 'reviewer', '   ', {
        workingDirectory: dir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('rejects an unresolvable role as a usage error', async () => {
    await scaffold();
    await expect(
      validateRunInvocation(lookup, 'ghost', 'assess the diff', {
        workingDirectory: dir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('rejects a worktree-scoped role outside a provisioned worktree', async () => {
    const roleDir: string = join(dir, '.devin', 'agents', 'executor');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      [
        '---',
        'omd-output: evidence.json',
        'omd-schema: evidence.schema.json',
        'omd-max-turns: 12',
        'omd-write-scope: worktree',
        '---',
        'You are the executor.',
      ].join('\n'),
      'utf8',
    );
    await writeFile(join(dir, 'evidence.schema.json'), JSON.stringify(SCHEMA));

    await expect(
      validateRunInvocation(lookup, 'executor', 'implement the plan', {
        workingDirectory: dir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('rejects a role whose declared schema file is missing, as the blocking form does', async () => {
    await scaffold();
    await rm(join(dir, 'review.schema.json'), { force: true });
    await expect(
      validateRunInvocation(lookup, 'reviewer', 'assess the diff', {
        workingDirectory: dir,
        provisionedWorktree: false,
      }),
    ).rejects.toThrow(UsageError);
  });
});
