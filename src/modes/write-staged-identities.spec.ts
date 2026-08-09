import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readStagedIdentities } from './read-staged-identities';
import type { StagedIdentity } from './staged-identity';
import { writeStagedIdentities } from './write-staged-identities';

const ENTRY: StagedIdentity = {
  sessionId: 'sess-1',
  invocation: 'mode set plan',
  stagedAt: 10,
};

describe('writeStagedIdentities', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-write-staged-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('records the staging set of a session', async () => {
    await writeStagedIdentities(projectDir, 'sess-1', [ENTRY]);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([ENTRY]);
  });

  it('replaces the staging set on a later write', async () => {
    await writeStagedIdentities(projectDir, 'sess-1', [ENTRY]);
    await writeStagedIdentities(projectDir, 'sess-1', []);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('writes nothing for an id that would escape the root', async () => {
    await writeStagedIdentities(projectDir, '../escape', [ENTRY]);

    expect(await readStagedIdentities(projectDir, '../escape')).toEqual([]);
  });
});
