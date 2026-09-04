import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writePendingNotices } from '../guard/write-pending-notices';
import { readPendingNotices } from '../guard/read-pending-notices';
import { appendNotepadEntry } from '../memory/append-notepad-entry';
import { deriveAmbientContext } from './derive-ambient-context';
import { recordSessionSeen } from './record-session-seen';
import { setSessionMode } from './set-session-mode';
import { stageSessionIdentity } from './stage-session-identity';

describe('deriveAmbientContext', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-ambient-context-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('announces the layer in a project with nothing to inject', async () => {
    const context: string = await deriveAmbientContext(
      projectDir,
      'sess-1',
      100,
    );

    expect(context).toBe('Oh My Devin layer active.');
  });

  it('carries the session own active mode', async () => {
    await recordSessionSeen(projectDir, 'sess-1', 100);
    await stageSessionIdentity(projectDir, 'sess-1', 'omd mode set plan', 100);
    await setSessionMode(projectDir, 'plan', null, 'mode set plan', 101);

    const context: string = await deriveAmbientContext(
      projectDir,
      'sess-1',
      110,
    );

    expect(context).toContain('plan mode active');
  });

  it('carries the notepad priority entries', async () => {
    await appendNotepadEntry(projectDir, 'priority', 'gate on staging', 10);

    const context: string = await deriveAmbientContext(
      projectDir,
      'sess-1',
      110,
    );

    expect(context).toContain('gate on staging');
  });

  it('carries no other session modes', async () => {
    await recordSessionSeen(projectDir, 'sess-2', 100);
    await stageSessionIdentity(projectDir, 'sess-2', 'omd mode set team', 100);
    await setSessionMode(projectDir, 'team', null, 'mode set team', 101);

    const context: string = await deriveAmbientContext(
      projectDir,
      'sess-1',
      110,
    );

    expect(context).not.toContain('team mode active');
  });

  it('degrades to the announcement when no session owns the event', async () => {
    expect(await deriveAmbientContext(projectDir, null, 100)).toBe(
      'Oh My Devin layer active.',
    );
  });

  it('carries a warned write notice on the next prompt', async () => {
    await writePendingNotices(projectDir, 'sess-1', [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);

    const context: string = await deriveAmbientContext(
      projectDir,
      'sess-1',
      110,
    );

    expect(context).toContain('src/a.ts');
  });

  it('carries no notice for that write on a later prompt', async () => {
    await writePendingNotices(projectDir, 'sess-1', [
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);
    await deriveAmbientContext(projectDir, 'sess-1', 110);

    const later: string = await deriveAmbientContext(projectDir, 'sess-1', 120);

    expect(later).not.toContain('src/a.ts');
    expect(await readPendingNotices(projectDir, 'sess-1')).toEqual([]);
  });
});
