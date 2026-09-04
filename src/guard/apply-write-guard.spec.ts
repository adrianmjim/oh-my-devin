import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  utimes,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { HookEvent } from '../modes/hook-event';
import type { SessionId } from '../modes/session-id';
import { writeSessionSlots } from '../modes/write-session-slots';
import { RunRecordPaths } from '../observability/run-record-paths';
import { writeRunClaim } from '../observability/write-run-claim';
import { applyWriteGuard } from './apply-write-guard';
import { guardAuditPath } from './guard-audit-path';
import { guardMessage } from './guard-message';
import type { PendingNotice } from './pending-notice';
import { projectConfigPath } from './project-config-path';
import { readPendingNotices } from './read-pending-notices';
import { renderAskOutput } from './render-ask-output';
import { renderDenyOutput } from './render-deny-output';

const SESSION: SessionId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const NOW: number = 1_000_000;

describe('applyWriteGuard', () => {
  let baseDir: string;
  let userFile: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-apply-guard-'));
    userFile = join(baseDir, 'user', 'omd', 'config.yaml');
    await mkdir(join(baseDir, '.omd'), { recursive: true });
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  function event(overrides: Partial<HookEvent>): HookEvent {
    return {
      sessionId: SESSION,
      command: null,
      tool: 'edit',
      filePath: 'src/index.ts',
      ...overrides,
    };
  }

  async function configure(level: string): Promise<void> {
    await writeFile(
      projectConfigPath(baseDir),
      `guard:\n  level: ${level}\n`,
      'utf8',
    );
  }

  async function auditLines(): Promise<readonly unknown[]> {
    let raw: string;
    try {
      raw = await readFile(guardAuditPath(baseDir), 'utf8');
    } catch {
      raw = '';
    }
    return raw
      .split('\n')
      .filter((line: string): boolean => line !== '')
      .map((line: string): unknown => JSON.parse(line));
  }

  it('blocks an out-of-scope write at strict and audits it', async () => {
    await configure('strict');

    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({}),
      NOW,
    );

    expect(output).toEqual(renderDenyOutput(guardMessage('src/index.ts')));
    expect(await auditLines()).toEqual([
      {
        timestamp: NOW,
        tool: 'edit',
        filePath: 'src/index.ts',
        decision: 'blocked',
        reason: guardMessage('src/index.ts'),
        enforcementLevel: 'strict',
        sessionId: SESSION,
      },
    ]);
  });

  it('downgrades an out-of-scope write at ask', async () => {
    await configure('ask');

    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({}),
      NOW,
    );

    expect(output).toEqual(renderAskOutput(guardMessage('src/index.ts')));
    expect(await auditLines()).toMatchObject([{ decision: 'asked' }]);
  });

  it('lets an out-of-scope write land at warn and queues its notice', async () => {
    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({}),
      NOW,
    );

    expect(output).toEqual({});
    expect(await auditLines()).toMatchObject([{ decision: 'warned' }]);
    expect(await readPendingNotices(baseDir, SESSION)).toEqual([
      { tool: 'edit', filePath: 'src/index.ts', noticedAt: NOW },
    ]);
  });

  it('passes a layer-path write at strict and audits it as allowed', async () => {
    await configure('strict');

    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({ filePath: '.omd/notes.json' }),
      NOW,
    );

    expect(output).toEqual({});
    expect(await auditLines()).toMatchObject([{ decision: 'allowed' }]);
    expect(await readPendingNotices(baseDir, SESSION)).toEqual([]);
  });

  it('intercepts nothing at off', async () => {
    await configure('off');

    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({}),
      NOW,
    );

    expect(output).toEqual({});
    expect(await auditLines()).toEqual([]);
  });

  it('blocks an out-of-scope write while autopilot raises warn', async () => {
    await mkdir(join(baseDir, '.omd', 'modes', SESSION), { recursive: true });
    await writeSessionSlots(baseDir, SESSION, [
      {
        mode: 'autopilot',
        sessionId: SESSION,
        activatedAt: 1,
        correlatedRunId: null,
      },
    ]);

    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({}),
      NOW,
    );

    expect(output).toEqual(renderDenyOutput(guardMessage('src/index.ts')));
  });

  it('passes shell and read-only tools undecided and unaudited', async () => {
    await configure('strict');

    for (const tool of ['exec', 'bash', 'read', 'grep']) {
      const output: Record<string, unknown> = await applyWriteGuard(
        baseDir,
        baseDir,
        userFile,
        event({ tool, filePath: null, command: 'rm -rf src' }),
        NOW,
      );

      expect(output).toEqual({});
    }
    expect(await auditLines()).toEqual([]);
  });

  it('passes a write naming no target undecided', async () => {
    await configure('strict');

    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({ filePath: null }),
      NOW,
    );

    expect(output).toEqual({});
    expect(await auditLines()).toEqual([]);
  });

  it('passes a contractual session undecided and unaudited', async () => {
    await configure('strict');
    const worktree: string = join(baseDir, '.omd', 'worktrees', 'w1');
    await mkdir(worktree, { recursive: true });
    await writeRunClaim(baseDir, 'run-1', {
      workingDirectory: worktree,
      worktreeProvisioned: true,
      sessionId: null,
    });
    const fresh: Date = new Date(NOW);
    await utimes(new RunRecordPaths(baseDir, 'run-1').dir, fresh, fresh);

    const output: Record<string, unknown> = await applyWriteGuard(
      baseDir,
      worktree,
      userFile,
      event({ filePath: join(worktree, 'src', 'a.ts') }),
      NOW,
    );

    expect(output).toEqual({});
    expect(await auditLines()).toEqual([]);
  });

  it('queues every warned write for the session', async () => {
    await applyWriteGuard(baseDir, baseDir, userFile, event({}), NOW);
    await applyWriteGuard(
      baseDir,
      baseDir,
      userFile,
      event({ filePath: 'src/other.ts' }),
      NOW + 1,
    );

    const queued: readonly PendingNotice[] = await readPendingNotices(
      baseDir,
      SESSION,
    );

    expect(queued).toHaveLength(2);
  });
});
