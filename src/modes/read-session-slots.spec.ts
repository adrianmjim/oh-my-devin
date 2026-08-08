import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readSessionSlots } from './read-session-slots';
import { SessionStatePaths } from './session-state-paths';

describe('readSessionSlots', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-read-slots-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeSlotsFile(content: string): Promise<void> {
    const paths: SessionStatePaths = new SessionStatePaths(
      projectDir,
      'sess-1',
    );
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.slots, content, 'utf8');
  }

  it('reads no slots for a session that never activated a mode', async () => {
    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([]);
  });

  it('reads no slots from an unparseable record', async () => {
    await writeSlotsFile('not json at all');

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([]);
  });

  it('drops slots whose shape it does not recognize', async () => {
    await writeSlotsFile(
      JSON.stringify([
        {
          mode: 'plan',
          sessionId: 'sess-1',
          activatedAt: 10,
          correlatedRunId: null,
        },
        { mode: 'verify' },
      ]),
    );

    expect(await readSessionSlots(projectDir, 'sess-1')).toEqual([
      {
        mode: 'plan',
        sessionId: 'sess-1',
        activatedAt: 10,
        correlatedRunId: null,
      },
    ]);
  });
});
