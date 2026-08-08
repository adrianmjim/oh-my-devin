import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { JournalWriter } from '../observability/journal-writer';
import type { ProgressEvent } from '../observability/progress-event';
import { RunRecordPaths } from '../observability/run-record-paths';
import { writeLivenessStamp } from '../observability/write-liveness-stamp';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

interface HookSpecificOutput {
  readonly additionalContext?: string;
  readonly decision?: string;
  readonly reason?: string;
}

interface HookOutput {
  readonly decision?: string;
  readonly reason?: string;
  readonly hookSpecificOutput?: HookSpecificOutput;
}

function runHook(
  dir: string,
  phase: string,
  event: unknown,
): Promise<HookOutput> {
  return new Promise<HookOutput>(
    (
      resolve: (output: HookOutput) => void,
      reject: (error: Error) => void,
    ): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        process.execPath,
        [join(dir, '.devin', 'hooks', 'omd-mode.mjs'), phase],
        { cwd: dir },
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

function injectionFor(dir: string, sessionId: string): Promise<HookOutput> {
  return runHook(dir, 'user-prompt', {
    hook_event_name: 'UserPromptSubmit',
    session_id: sessionId,
    prompt: 'continue',
  });
}

function stopFor(dir: string, sessionId: string): Promise<HookOutput> {
  return runHook(dir, 'stop', {
    hook_event_name: 'Stop',
    session_id: sessionId,
  });
}

describe('omd mode (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  async function fromSession(
    sessionId: string,
    argv: readonly string[],
  ): Promise<CommandResult> {
    if (project === null) {
      throw new Error('project not initialised');
    }
    await runHook(project.dir, 'tool-use', {
      hook_event_name: 'PreToolUse',
      session_id: sessionId,
      tool_input: { command: `omd ${argv.join(' ')}` },
    });
    return project.run(argv);
  }

  async function seedRun(
    runId: string,
    events: readonly ProgressEvent[],
    stampedAt: number | null,
  ): Promise<void> {
    if (project === null) {
      throw new Error('project not initialised');
    }
    const paths: RunRecordPaths = new RunRecordPaths(project.dir, runId);
    const writer: JournalWriter = new JournalWriter(paths.journal);
    for (const event of events) {
      await writer.append(event);
    }
    if (stampedAt !== null) {
      await writeLivenessStamp(paths.liveness, stampedAt);
    }
  }

  it('attributes an activation to its session and clears it', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    const set: CommandResult = await fromSession('sess-a', [
      'mode',
      'set',
      'team',
    ]);
    expect(set.exitCode, set.stderr).toBe(0);
    expect(set.stdout).toContain('mode set: team');

    const injected: HookOutput = await injectionFor(project.dir, 'sess-a');
    expect(injected.hookSpecificOutput?.additionalContext).toContain(
      'Active mode: team',
    );

    const clear: CommandResult = await fromSession('sess-a', ['mode', 'clear']);
    expect(clear.exitCode, clear.stderr).toBe(0);
    expect(clear.stdout).toContain('mode cleared: team');

    const released: HookOutput = await injectionFor(project.dir, 'sess-a');
    expect(released.hookSpecificOutput?.additionalContext).toBe(
      'Oh My Devin layer active.',
    );
  });

  it('refuses an activation no live session owns', async () => {
    project = await createE2eProject();

    const set: CommandResult = await project.run(['mode', 'set', 'team']);

    expect(set.exitCode).toBe(1);
    expect(set.stdout).toContain(
      'mode refused: team — no live session owns this invocation',
    );
  });

  it('keeps two concurrent sessions on disjoint mode state', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    await fromSession('sess-a', ['mode', 'set', 'plan']);
    await fromSession('sess-b', ['mode', 'set', 'verify']);

    const first: HookOutput = await injectionFor(project.dir, 'sess-a');
    const second: HookOutput = await injectionFor(project.dir, 'sess-b');

    expect(first.hookSpecificOutput?.additionalContext).toContain(
      'Active mode: plan',
    );
    expect(first.hookSpecificOutput?.additionalContext).not.toContain('verify');
    expect(second.hookSpecificOutput?.additionalContext).toContain(
      'Active mode: verify',
    );
    expect(second.hookSpecificOutput?.additionalContext).not.toContain('plan');
  });

  it('refuses an exclusive-class mode another live session holds', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    await fromSession('sess-a', ['mode', 'set', 'autopilot']);
    const refused: CommandResult = await fromSession('sess-b', [
      'mode',
      'set',
      'team',
    ]);

    expect(refused.exitCode).toBe(1);
    expect(refused.stdout).toContain(
      'mode refused: team — autopilot is held by session sess-a',
    );

    const holder: HookOutput = await injectionFor(project.dir, 'sess-a');
    expect(holder.hookSpecificOutput?.additionalContext).toContain(
      'Active mode: autopilot',
    );
  });

  it('displaces the exclusive-class mode the same session holds', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    await fromSession('sess-a', ['mode', 'set', 'autopilot']);
    const displaced: CommandResult = await fromSession('sess-a', [
      'mode',
      'set',
      'ralph',
    ]);

    expect(displaced.exitCode, displaced.stderr).toBe(0);
    expect(displaced.stdout).toContain('mode set: ralph (displaced autopilot)');

    const injected: HookOutput = await injectionFor(project.dir, 'sess-a');
    expect(injected.hookSpecificOutput?.additionalContext).toContain(
      'Active mode: ralph',
    );
    expect(injected.hookSpecificOutput?.additionalContext).not.toContain(
      'Active mode: autopilot',
    );
  });

  it('blocks the stop while correlated work is non-terminal and releases on its terminal outcome', async () => {
    project = await createE2eProject();
    await project.run(['setup']);
    await seedRun(
      'run-live',
      [
        {
          type: 'runLaunched',
          timestamp: 1000,
          runId: 'run-live',
          runKind: 'single-role',
          subject: 'reviewer',
          maxTurns: 8,
          artifactPath: 'review.json',
        },
      ],
      Date.now(),
    );

    const correlated: CommandResult = await fromSession('sess-a', [
      'mode',
      'set',
      'ralph',
      '--run',
      'run-live',
    ]);
    expect(correlated.exitCode, correlated.stderr).toBe(0);

    const blocked: HookOutput = await stopFor(project.dir, 'sess-a');
    expect(blocked.decision).toBe('block');
    expect(blocked.hookSpecificOutput?.decision).toBe('block');
    expect(blocked.reason).toContain('run-live');
    expect(blocked.reason).toContain('running');

    await seedRun(
      'run-live',
      [
        {
          type: 'terminalOutcome',
          timestamp: 2000,
          succeeded: true,
          failureTier: null,
        },
      ],
      Date.now(),
    );

    const approved: HookOutput = await stopFor(project.dir, 'sess-a');
    expect(approved.decision).toBe('approve');
    expect(approved.hookSpecificOutput?.decision).toBe('approve');
  });
});
