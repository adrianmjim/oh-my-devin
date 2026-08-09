import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readStagedIdentities } from './read-staged-identities';
import { stageSessionIdentity } from './stage-session-identity';
import type { StagedIdentity } from './staged-identity';

describe('stageSessionIdentity', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-stage-identity-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('stages the session, invocation and time of a mode command', async () => {
    await stageSessionIdentity(projectDir, 'sess-1', 'omd mode set plan', 10);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([
      { sessionId: 'sess-1', invocation: 'mode set plan', stagedAt: 10 },
    ]);
  });

  it('stages nothing for a command that invokes another verb', async () => {
    await stageSessionIdentity(projectDir, 'sess-1', 'omd status --json', 10);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('stages nothing for a command that does not invoke omd', async () => {
    await stageSessionIdentity(projectDir, 'sess-1', 'ls -la', 10);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('keeps successive stagings of one session', async () => {
    await stageSessionIdentity(projectDir, 'sess-1', 'omd mode set plan', 10);
    await stageSessionIdentity(projectDir, 'sess-1', 'omd mode clear', 20);

    const staged: readonly StagedIdentity[] = await readStagedIdentities(
      projectDir,
      'sess-1',
    );

    expect(
      staged.map((entry: StagedIdentity): string => entry.invocation),
    ).toEqual(['mode set plan', 'mode clear']);
  });

  it('stages under the owning session only', async () => {
    await stageSessionIdentity(projectDir, 'sess-1', 'omd mode set plan', 10);

    expect(await readStagedIdentities(projectDir, 'sess-2')).toEqual([]);
  });

  it('stages nothing for an id that would escape the root', async () => {
    await stageSessionIdentity(
      projectDir,
      '../escape',
      'omd mode set plan',
      10,
    );

    expect(await readStagedIdentities(projectDir, '../escape')).toEqual([]);
  });
});
