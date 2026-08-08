import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { handleToolUseEvent } from './handle-tool-use-event';
import { readSessionSeen } from './read-session-seen';
import { readStagedIdentities } from './read-staged-identities';

describe('handleToolUseEvent', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-tool-use-'));
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('refreshes the session registry from the piped event', async () => {
    await handleToolUseEvent(
      projectDir,
      { sessionId: 'sess-1', command: 'ls -la' },
      500,
    );

    expect(await readSessionSeen(projectDir, 'sess-1')).toEqual({
      sessionId: 'sess-1',
      lastSeenAt: 500,
    });
  });

  it('stages the identity of a mode invocation', async () => {
    await handleToolUseEvent(
      projectDir,
      { sessionId: 'sess-1', command: 'omd mode set plan' },
      500,
    );

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([
      { sessionId: 'sess-1', invocation: 'mode set plan', stagedAt: 500 },
    ]);
  });

  it('stages nothing for a command that is not a mode invocation', async () => {
    await handleToolUseEvent(
      projectDir,
      { sessionId: 'sess-1', command: 'ls -la' },
      500,
    );

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('records nothing for an event carrying no session', async () => {
    await handleToolUseEvent(
      projectDir,
      { sessionId: null, command: 'omd mode set plan' },
      500,
    );

    expect(await readSessionSeen(projectDir, 'sess-1')).toBeNull();
  });

  it('tolerates an event carrying no command', async () => {
    await handleToolUseEvent(
      projectDir,
      { sessionId: 'sess-1', command: null },
      500,
    );

    expect(await readSessionSeen(projectDir, 'sess-1')).not.toBeNull();
  });
});
