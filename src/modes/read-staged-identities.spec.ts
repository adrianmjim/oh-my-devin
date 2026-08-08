import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readStagedIdentities } from './read-staged-identities';
import { SessionStatePaths } from './session-state-paths';

describe('readStagedIdentities', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-read-staged-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  async function writeStagedFile(content: string): Promise<void> {
    const paths: SessionStatePaths = new SessionStatePaths(
      projectDir,
      'sess-1',
    );
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.staged, content, 'utf8');
  }

  it('reads nothing for a session that staged nothing', async () => {
    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('reads nothing from an unparseable record', async () => {
    await writeStagedFile('not json at all');

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('drops entries whose shape it does not recognize', async () => {
    await writeStagedFile(
      JSON.stringify([
        { sessionId: 'sess-1', invocation: 'mode clear', stagedAt: 1 },
        { sessionId: 'sess-1' },
      ]),
    );

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([
      { sessionId: 'sess-1', invocation: 'mode clear', stagedAt: 1 },
    ]);
  });
});
