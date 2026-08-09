import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { delimiter, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { RunRecordPaths } from '../observability/run-record-paths';
import { writeRunClaim } from '../observability/write-run-claim';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';
import { guardAuditPath } from './guard-audit-path';
import { projectConfigPath } from './project-config-path';

interface HookSpecificOutput {
  readonly additionalContext?: string;
  readonly permissionDecision?: string;
  readonly permissionDecisionReason?: string;
}

interface HookOutput {
  readonly decision?: string;
  readonly reason?: string;
  readonly hookSpecificOutput?: HookSpecificOutput;
}

const SESSION: string = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

function runHook(
  dir: string,
  phase: string,
  event: unknown,
  binDir: string,
  cwd: string,
): Promise<HookOutput> {
  return new Promise<HookOutput>(
    (
      resolve: (output: HookOutput) => void,
      reject: (error: Error) => void,
    ): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        process.execPath,
        [join(dir, '.devin', 'hooks', 'omd-mode.mjs'), phase],
        {
          cwd,
          env: {
            ...process.env,
            PATH: `${binDir}${delimiter}${process.env['PATH'] ?? ''}`,
          },
        },
      );
      let stdout: string = '';
      child.stdout.on('data', (chunk: Buffer): void => {
        stdout += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (): void => {
        resolve(JSON.parse(stdout) as HookOutput);
      });
      child.stdin.write(JSON.stringify(event));
      child.stdin.end();
    },
  );
}

describe('omd write guard (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  function current(): E2eProject {
    if (project === null) {
      throw new Error('project not initialised');
    }
    return project;
  }

  async function start(level: string | null): Promise<E2eProject> {
    project = await createE2eProject();
    await project.run(['setup']);
    if (level !== null) {
      await mkdir(join(project.dir, '.omd'), { recursive: true });
      await writeFile(
        projectConfigPath(project.dir),
        `guard:\n  level: ${level}\n`,
        'utf8',
      );
    }
    return project;
  }

  function write(
    filePath: string,
    sessionId: string = SESSION,
    cwd?: string,
  ): Promise<HookOutput> {
    const active: E2eProject = current();
    return runHook(
      active.dir,
      'tool-use',
      {
        hook_event_name: 'PreToolUse',
        session_id: sessionId,
        tool_name: 'edit',
        tool_input: { file_path: filePath },
      },
      active.binDir,
      cwd ?? active.dir,
    );
  }

  function promptInjection(sessionId: string = SESSION): Promise<HookOutput> {
    const active: E2eProject = current();
    return runHook(
      active.dir,
      'user-prompt',
      {
        hook_event_name: 'UserPromptSubmit',
        session_id: sessionId,
        prompt: 'continue',
      },
      active.binDir,
      active.dir,
    );
  }

  async function auditDecisions(): Promise<readonly string[]> {
    let raw: string;
    try {
      raw = await readFile(guardAuditPath(current().dir), 'utf8');
    } catch {
      raw = '';
    }
    return raw
      .split('\n')
      .filter((line: string): boolean => line !== '')
      .map((line: string): string => {
        const record: unknown = JSON.parse(line);
        return (record as Record<string, string>)['decision'] ?? '';
      });
  }

  it('blocks an out-of-scope write at strict with the reason', async () => {
    await start('strict');

    const answer: HookOutput = await write('src/index.ts');

    expect(answer.hookSpecificOutput?.permissionDecision).toBe('deny');
    expect(answer.hookSpecificOutput?.permissionDecisionReason).toContain(
      'omd roles list',
    );
    expect(answer.reason).toContain('src/index.ts');
    expect(await auditDecisions()).toEqual(['blocked']);
  });

  it('downgrades an out-of-scope write at ask', async () => {
    await start('ask');

    const answer: HookOutput = await write('src/index.ts');

    expect(answer.hookSpecificOutput?.permissionDecision).toBe('ask');
    expect(answer.decision).toBeUndefined();
    expect(await auditDecisions()).toEqual(['asked']);
  });

  it('lands a warned write and notices it on the next prompt', async () => {
    await start('warn');

    expect(await write('src/index.ts')).toEqual({});
    expect(await auditDecisions()).toEqual(['warned']);

    const injected: HookOutput = await promptInjection();

    expect(injected.hookSpecificOutput?.additionalContext).toContain(
      'src/index.ts',
    );

    const later: HookOutput = await promptInjection();

    expect(later.hookSpecificOutput?.additionalContext).not.toContain(
      'src/index.ts',
    );
  });

  it('intercepts nothing at off', async () => {
    await start('off');

    expect(await write('src/index.ts')).toEqual({});
    expect(await auditDecisions()).toEqual([]);
  });

  it('passes a layer-path write at strict', async () => {
    await start('strict');

    expect(await write('.omd/notes.json')).toEqual({});
    expect(await auditDecisions()).toEqual(['allowed']);
  });

  it('blocks an out-of-scope write while autopilot is active', async () => {
    const active: E2eProject = await start(null);
    await runHook(
      active.dir,
      'tool-use',
      {
        hook_event_name: 'PreToolUse',
        session_id: SESSION,
        tool_input: { command: 'omd mode set autopilot' },
      },
      active.binDir,
      active.dir,
    );
    const set: CommandResult = await active.run(['mode', 'set', 'autopilot']);
    expect(set.exitCode, set.stderr).toBe(0);

    const answer: HookOutput = await write('src/index.ts');

    expect(answer.hookSpecificOutput?.permissionDecision).toBe('deny');
  });

  it('exempts a contractual session running in its worktree', async () => {
    const active: E2eProject = await start('strict');
    const worktree: string = join(active.dir, '.omd', 'worktrees', 'w1');
    await mkdir(worktree, { recursive: true });
    await writeRunClaim(active.dir, 'run-1', {
      workingDirectory: worktree,
      worktreeProvisioned: true,
      sessionId: null,
    });
    await writeFile(
      join(new RunRecordPaths(active.dir, 'run-1').dir, 'touch'),
      '',
      'utf8',
    );

    const answer: HookOutput = await write(
      join(worktree, 'src', 'a.ts'),
      'role-session',
      worktree,
    );

    expect(answer).toEqual({});
    expect(await auditDecisions()).toEqual([]);
  });

  it('leaves a shell write unintercepted at strict', async () => {
    const active: E2eProject = await start('strict');

    const answer: HookOutput = await runHook(
      active.dir,
      'tool-use',
      {
        hook_event_name: 'PreToolUse',
        session_id: SESSION,
        tool_name: 'exec',
        tool_input: { command: 'echo hi > src/index.ts' },
      },
      active.binDir,
      active.dir,
    );

    expect(answer).toEqual({});
    expect(await auditDecisions()).toEqual([]);
  });

  it('governs the interactive session while a project-directory run is live', async () => {
    const active: E2eProject = await start('strict');
    await writeRunClaim(active.dir, 'run-1', {
      workingDirectory: active.dir,
      worktreeProvisioned: false,
      sessionId: null,
    });
    await writeFile(
      join(new RunRecordPaths(active.dir, 'run-1').dir, 'touch'),
      '',
      'utf8',
    );

    const answer: HookOutput = await write('src/index.ts');

    expect(answer.hookSpecificOutput?.permissionDecision).toBe('deny');
    expect(await auditDecisions()).toEqual(['blocked']);
  });

  it('exempts no session by a claim that names no worktree', async () => {
    const active: E2eProject = await start('strict');
    await writeRunClaim(active.dir, 'run-1', {
      workingDirectory: active.dir,
      worktreeProvisioned: false,
      sessionId: SESSION,
    });
    await writeFile(
      join(new RunRecordPaths(active.dir, 'run-1').dir, 'touch'),
      '',
      'utf8',
    );

    const answer: HookOutput = await write('src/index.ts', SESSION);

    expect(
      answer.hookSpecificOutput?.permissionDecision,
      'a directory-shared run must never exempt by identity',
    ).toBe('deny');
  });
});
