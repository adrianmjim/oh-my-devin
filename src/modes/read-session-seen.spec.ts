import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readSessionSeen } from './read-session-seen';
import { SessionStatePaths } from './session-state-paths';

describe('readSessionSeen', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-read-session-seen-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeSeenFile(
    sessionId: string,
    content: string,
  ): Promise<void> {
    const paths: SessionStatePaths = new SessionStatePaths(
      projectDir,
      sessionId,
    );
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.seen, content, 'utf8');
  }

  it('reads nothing for a session that was never seen', async () => {
    expect(await readSessionSeen(projectDir, 'sess-1')).toBeNull();
  });

  it('reads nothing from an unparseable record', async () => {
    await writeSeenFile('sess-1', 'not json at all');

    expect(await readSessionSeen(projectDir, 'sess-1')).toBeNull();
  });

  it('reads nothing from a record whose shape it does not recognize', async () => {
    await writeSeenFile('sess-1', JSON.stringify({ lastSeenAt: 'soon' }));

    expect(await readSessionSeen(projectDir, 'sess-1')).toBeNull();
  });

  it('reads nothing from a record naming a different session', async () => {
    await writeSeenFile(
      'sess-1',
      JSON.stringify({ sessionId: '../../marker', lastSeenAt: 0 }),
    );

    expect(await readSessionSeen(projectDir, 'sess-1')).toBeNull();
  });

  it('reads back a recognized record', async () => {
    await writeSeenFile(
      'sess-1',
      JSON.stringify({ sessionId: 'sess-1', lastSeenAt: 42 }),
    );

    expect(await readSessionSeen(projectDir, 'sess-1')).toEqual({
      sessionId: 'sess-1',
      lastSeenAt: 42,
    });
  });
});
