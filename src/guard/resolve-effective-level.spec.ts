import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { SessionId } from '../modes/session-id';
import { writeSessionSlots } from '../modes/write-session-slots';
import { projectConfigPath } from './project-config-path';
import { resolveEffectiveLevel } from './resolve-effective-level';

const SESSION: SessionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('resolveEffectiveLevel', () => {
  let baseDir: string;
  let userFile: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-effective-level-'));
    userFile = join(baseDir, 'user', 'omd', 'config.yaml');
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  async function configureProject(level: string): Promise<void> {
    await mkdir(join(baseDir, '.omd'), { recursive: true });
    await writeFile(
      projectConfigPath(baseDir),
      `guard:\n  level: ${level}\n`,
      'utf8',
    );
  }

  async function activate(mode: string): Promise<void> {
    await mkdir(join(baseDir, '.omd', 'modes', SESSION), { recursive: true });
    await writeSessionSlots(baseDir, SESSION, [
      { mode, sessionId: SESSION, activatedAt: 10, correlatedRunId: null },
    ]);
  }

  it('resolves the configured level for a session holding no mode', async () => {
    await configureProject('ask');

    expect(await resolveEffectiveLevel(baseDir, userFile, SESSION)).toBe('ask');
  });

  it('raises warn to strict while autopilot is active', async () => {
    await activate('autopilot');

    expect(await resolveEffectiveLevel(baseDir, userFile, SESSION)).toBe(
      'strict',
    );
  });

  it('restores the configured level once the mode is cleared', async () => {
    await activate('autopilot');
    await writeSessionSlots(baseDir, SESSION, []);

    expect(await resolveEffectiveLevel(baseDir, userFile, SESSION)).toBe(
      'warn',
    );
  });

  it('leaves the level alone for a non-raising mode', async () => {
    await configureProject('off');
    await activate('ralph');

    expect(await resolveEffectiveLevel(baseDir, userFile, SESSION)).toBe('off');
  });

  it('resolves the configured level for an unidentified session', async () => {
    await configureProject('strict');

    expect(await resolveEffectiveLevel(baseDir, userFile, null)).toBe('strict');
  });
});
