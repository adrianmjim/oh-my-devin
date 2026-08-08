import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deriveSessionInjection } from './derive-session-injection';
import { recordSessionSeen } from './record-session-seen';
import { setSessionMode } from './set-session-mode';
import { stageSessionIdentity } from './stage-session-identity';

describe('deriveSessionInjection', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-session-injection-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function activate(
    sessionId: string,
    mode: string,
    at: number,
  ): Promise<void> {
    await recordSessionSeen(projectDir, sessionId, at);
    await stageSessionIdentity(
      projectDir,
      sessionId,
      `omd mode set ${mode}`,
      at,
    );
    await setSessionMode(projectDir, mode, null, `mode set ${mode}`, at + 1);
  }

  it('injects nothing for a fresh session', async () => {
    expect(await deriveSessionInjection(projectDir, 'sess-1', 100)).toBe('');
  });

  it('injects nothing when no session owns the event', async () => {
    expect(await deriveSessionInjection(projectDir, null, 100)).toBe('');
  });

  it('injects the session own active mode context', async () => {
    await activate('sess-1', 'plan', 100);

    const injected: string = await deriveSessionInjection(
      projectDir,
      'sess-1',
      110,
    );

    expect(injected).toContain('plan');
    expect(injected).toContain('plan mode active');
  });

  it('injects every active mode when several are held', async () => {
    await activate('sess-1', 'plan', 100);
    await activate('sess-1', 'verify', 110);

    const injected: string = await deriveSessionInjection(
      projectDir,
      'sess-1',
      120,
    );

    expect(injected).toContain('plan mode active');
    expect(injected).toContain('verify mode active');
  });

  it('injects no other session modes', async () => {
    await activate('sess-2', 'team', 100);

    const injected: string = await deriveSessionInjection(
      projectDir,
      'sess-1',
      110,
    );

    expect(injected).toBe('');
  });

  it('injects nothing once the session own activation is stale', async () => {
    await activate('sess-1', 'plan', 100);

    expect(await deriveSessionInjection(projectDir, 'sess-1', 90000000)).toBe(
      '',
    );
  });
});
