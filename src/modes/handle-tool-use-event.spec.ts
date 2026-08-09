import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { guardMessage } from '../guard/guard-message';
import { renderDenyOutput } from '../guard/render-deny-output';
import type { HookEvent } from './hook-event';
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

  function event(overrides: Partial<HookEvent>): HookEvent {
    return {
      sessionId: 'sess-1',
      command: null,
      tool: null,
      filePath: null,
      ...overrides,
    };
  }

  function handle(
    overrides: Partial<HookEvent>,
  ): Promise<Record<string, unknown>> {
    return handleToolUseEvent(
      projectDir,
      projectDir,
      join(projectDir, 'user', 'omd', 'config.yaml'),
      event(overrides),
      500,
    );
  }

  it('refreshes the session registry from the piped event', async () => {
    await handle({ sessionId: 'sess-1', command: 'ls -la' });

    expect(await readSessionSeen(projectDir, 'sess-1')).toEqual({
      sessionId: 'sess-1',
      lastSeenAt: 500,
    });
  });

  it('stages the identity of a mode invocation', async () => {
    await handle({ sessionId: 'sess-1', command: 'omd mode set plan' });

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([
      { sessionId: 'sess-1', invocation: 'mode set plan', stagedAt: 500 },
    ]);
  });

  it('stages nothing for a command that is not a mode invocation', async () => {
    await handle({ sessionId: 'sess-1', command: 'ls -la' });

    expect(await readStagedIdentities(projectDir, 'sess-1')).toEqual([]);
  });

  it('records nothing for an event carrying no session', async () => {
    await handle({ sessionId: null, command: 'omd mode set plan' });

    expect(await readSessionSeen(projectDir, 'sess-1')).toBeNull();
  });

  it('tolerates an event carrying no command', async () => {
    await handle({ sessionId: 'sess-1', command: null });

    expect(await readSessionSeen(projectDir, 'sess-1')).not.toBeNull();
  });

  it('answers the guard decision for an out-of-scope write', async () => {
    await mkdir(join(projectDir, '.omd'), { recursive: true });
    await writeFile(
      join(projectDir, '.omd', 'config.yaml'),
      'guard:\n  level: strict\n',
      'utf8',
    );

    const output: Record<string, unknown> = await handle({
      tool: 'edit',
      filePath: 'src/index.ts',
    });

    expect(output).toEqual(renderDenyOutput(guardMessage('src/index.ts')));
  });

  it('answers an empty decision for a command event', async () => {
    expect(await handle({ command: 'ls -la' })).toEqual({});
  });
});
