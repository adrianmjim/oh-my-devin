import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { claimSessionIdentity } from './claim-session-identity';
import { readStagedIdentities } from './read-staged-identities';
import { recordSessionSeen } from './record-session-seen';
import type { SessionId } from './session-id';
import { stageSessionIdentity } from './stage-session-identity';

describe('claimSessionIdentity', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-claim-identity-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function stage(
    sessionId: string,
    command: string,
    at: number,
  ): Promise<void> {
    await recordSessionSeen(projectDir, sessionId, at);
    await stageSessionIdentity(projectDir, sessionId, command, at);
  }

  it('claims nothing in a project with no staging', async () => {
    expect(
      await claimSessionIdentity(projectDir, 'mode set plan', 100, 1000),
    ).toBeNull();
  });

  it('claims the session that staged the exact invocation', async () => {
    await stage('sess-1', 'omd mode set plan', 100);

    const claimed: SessionId | null = await claimSessionIdentity(
      projectDir,
      'mode set plan',
      110,
      1000,
    );

    expect(claimed).toBe('sess-1');
  });

  it('consumes the entry it claimed', async () => {
    await stage('sess-1', 'omd mode set plan', 100);

    await claimSessionIdentity(projectDir, 'mode set plan', 110, 1000);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('claims nothing for an invocation nobody staged', async () => {
    await stage('sess-1', 'omd mode set plan', 100);

    expect(
      await claimSessionIdentity(projectDir, 'mode set team', 110, 1000),
    ).toBeNull();
  });

  it('leaves unmatched stagings in place', async () => {
    await stage('sess-1', 'omd mode set plan', 100);

    await claimSessionIdentity(projectDir, 'mode set team', 110, 1000);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toHaveLength(1);
  });

  it('claims the freshest match when two sessions staged the same command', async () => {
    await stage('sess-1', 'omd mode set plan', 100);
    await stage('sess-2', 'omd mode set plan', 200);

    expect(
      await claimSessionIdentity(projectDir, 'mode set plan', 210, 1000),
    ).toBe('sess-2');
  });

  it('leaves the loser staging untouched', async () => {
    await stage('sess-1', 'omd mode set plan', 100);
    await stage('sess-2', 'omd mode set plan', 200);

    await claimSessionIdentity(projectDir, 'mode set plan', 210, 1000);

    expect(await readStagedIdentities(projectDir, 'sess-1')).toHaveLength(1);
  });

  it('claims nothing from a stale session', async () => {
    await stage('sess-1', 'omd mode set plan', 100);

    expect(
      await claimSessionIdentity(projectDir, 'mode set plan', 100000, 1000),
    ).toBeNull();
  });
});
