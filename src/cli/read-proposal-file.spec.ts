import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import { readProposalFile } from './read-proposal-file';

describe('readProposalFile', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-proposal-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns the contents of the file at a relative path', async () => {
    await writeFile(join(dir, 'proposal.md'), 'ship behind a flag\n');

    expect(await readProposalFile(dir, 'proposal.md')).toBe(
      'ship behind a flag\n',
    );
  });

  it('returns the contents of the file at an absolute path', async () => {
    const path: string = join(dir, 'proposal.md');
    await writeFile(path, 'ship behind a flag\n');

    expect(await readProposalFile(dir, path)).toBe('ship behind a flag\n');
  });

  it('rejects a missing path as a usage error naming the path', async () => {
    await expect(readProposalFile(dir, 'missing.md')).rejects.toThrow(
      UsageError,
    );
    await expect(readProposalFile(dir, 'missing.md')).rejects.toThrow(
      /missing\.md/,
    );
  });
});
