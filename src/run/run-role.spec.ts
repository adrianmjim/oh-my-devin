import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { EngineError } from '../engine/engine-error';
import type { ProgressEvent } from '../observability/progress-event';
import type { RunObserver } from '../observability/run-observer';
import type { RunReport } from '../outcome/run-report';
import { runRole } from './run-role';
import { UsageError } from './usage-error';

const SCHEMA = {
  type: 'object',
  required: ['verdict'],
  properties: { verdict: { type: 'string' } },
  additionalProperties: false,
};

interface TurnScript {
  readonly write?: string | null;
  readonly stdout?: string;
  readonly stderr?: string;
  readonly exitCode?: number;
}

class FakeRunner implements CommandRunner {
  public readonly invocations: CommandInvocation[] = [];
  private index = 0;
  private listed = false;

  public constructor(
    private readonly artifactPath: string,
    private readonly scripts: readonly TurnScript[],
    private readonly workingDirectory: string,
    private readonly firstListingEmpty: boolean = false,
  ) {}

  public async run(inv: CommandInvocation): Promise<CommandResult> {
    this.invocations.push(inv);
    if (inv.args.includes('list')) {
      const empty: boolean = this.firstListingEmpty && !this.listed;
      this.listed = true;
      return {
        stdout: empty
          ? '[]'
          : JSON.stringify([
              { id: 's1', working_directory: this.workingDirectory },
            ]),
        stderr: '',
        exitCode: 0,
      };
    }
    const script: TurnScript = this.scripts[this.index] ?? {};
    this.index += 1;
    if (script.write === null) {
      await rm(this.artifactPath, { force: true });
    } else if (script.write !== undefined) {
      await writeFile(this.artifactPath, script.write, 'utf8');
    }
    return {
      stdout: script.stdout ?? '',
      stderr: script.stderr ?? '',
      exitCode: script.exitCode ?? 0,
    };
  }
}

class ClockAdvancingRunner implements CommandRunner {
  public constructor(
    private readonly inner: CommandRunner,
    private readonly advance: () => void,
  ) {}

  public async run(inv: CommandInvocation): Promise<CommandResult> {
    const result: CommandResult = await this.inner.run(inv);
    if (inv.args.includes('-p')) {
      this.advance();
    }
    return result;
  }
}

class RecordingObserver implements RunObserver {
  public readonly events: ProgressEvent[] = [];
  public closeCount = 0;

  public async append(event: ProgressEvent): Promise<void> {
    this.events.push(event);
    await Promise.resolve();
  }

  public close(): void {
    this.closeCount += 1;
  }

  public types(): readonly string[] {
    return this.events.map((event: ProgressEvent): string => event.type);
  }
}

describe('runRole', () => {
  let dir: string;
  let artifactPath: string;

  async function scaffold(
    maxTurns: number,
    roleModel: string | null = null,
    wallTime: string | null = null,
  ): Promise<void> {
    const roleDir: string = join(dir, '.devin', 'agents', 'reviewer');
    await mkdir(roleDir, { recursive: true });
    const agentMd: string = [
      '---',
      'omd-output: review.json',
      'omd-schema: review.schema.json',
      `omd-max-turns: ${maxTurns}`,
      ...(roleModel === null ? [] : [`model: ${roleModel}`]),
      ...(wallTime === null ? [] : [`omd-wall-time: ${wallTime}`]),
      '---',
      'You are the reviewer.',
    ].join('\n');
    await writeFile(join(roleDir, 'AGENT.md'), agentMd, 'utf8');
    await writeFile(join(dir, 'review.schema.json'), JSON.stringify(SCHEMA));
  }

  function run(
    scripts: readonly TurnScript[],
    model: string | null = null,
  ): Promise<RunReport> {
    return runRole({
      roleName: 'reviewer',
      task: 'assess the diff',
      workingDirectory: dir,
      model,
      runner: new FakeRunner(artifactPath, scripts, dir),
      clock: (): number => 0,
    });
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-run-'));
    artifactPath = join(dir, 'review.json');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('succeeds when the first turn produces a valid artifact', async () => {
    await scaffold(8);
    const report: RunReport = await run([
      { write: JSON.stringify({ verdict: 'pass' }) },
    ]);

    expect(report.failureTier).toBeNull();
    expect(report.artifactValid).toBe(true);
    expect(report.turnsUsed).toBe(1);
    expect(report.repairAttempted).toBe(false);
    expect(report.sessionId).toBe('s1');
  });

  it('repairs a first-turn invalid artifact and succeeds', async () => {
    await scaffold(8);
    const report: RunReport = await run([
      { write: JSON.stringify({ verdict: 7 }) },
      { write: JSON.stringify({ verdict: 'pass' }) },
    ]);

    expect(report.failureTier).toBeNull();
    expect(report.repairAttempted).toBe(true);
    expect(report.turnsUsed).toBe(2);
  });

  it('reports tier 2 when the repair still leaves the artifact invalid', async () => {
    await scaffold(8);
    const report: RunReport = await run([
      { write: JSON.stringify({ verdict: 7 }) },
      { write: JSON.stringify({ verdict: 7 }) },
    ]);

    expect(report.failureTier).toBe('invalid_artifact');
    expect(report.repairAttempted).toBe(true);
    expect(report.validationErrors.join(' ')).toMatch(/verdict/);
  });

  it('reports tier 3 when an exhausted budget forecloses repair', async () => {
    await scaffold(1);
    const report: RunReport = await run([
      { write: JSON.stringify({ verdict: 7 }) },
    ]);

    expect(report.failureTier).toBe('budget');
    expect(report.repairAttempted).toBe(false);
  });

  it('ends tier budget when wall time expires with turns remaining', async () => {
    await scaffold(8, null, '10s');
    let now: number = 0;
    const runner = new ClockAdvancingRunner(
      new FakeRunner(
        artifactPath,
        [{ write: JSON.stringify({ verdict: 7 }) }],
        dir,
      ),
      (): void => {
        now = 60000;
      },
    );
    const report: RunReport = await runRole({
      roleName: 'reviewer',
      task: 'assess the diff',
      workingDirectory: dir,
      model: null,
      runner,
      clock: (): number => now,
    });

    expect(report.failureTier).toBe('budget');
    expect(report.repairAttempted).toBe(false);
    expect(report.turnsUsed).toBe(1);
    expect(report.wallTimeMs).toBe(60000);
  });

  it('classifies a failed repair as invalid_artifact even when it exhausts the budget', async () => {
    await scaffold(2);
    const report: RunReport = await run([
      { write: JSON.stringify({ verdict: 7 }) },
      { write: JSON.stringify({ verdict: 7 }) },
    ]);

    expect(report.failureTier).toBe('invalid_artifact');
    expect(report.repairAttempted).toBe(true);
    expect(report.turnsUsed).toBe(2);
    expect(report.maxTurns).toBe(2);
  });

  it('reports tier 1 and skips repair on a deny hit', async () => {
    await scaffold(8);
    const report: RunReport = await run([
      { stderr: 'Error: A tool was rejected by the user', exitCode: 1 },
    ]);

    expect(report.failureTier).toBe('deny');
    expect(report.denyRule).toMatch(/rejected/i);
    expect(report.repairAttempted).toBe(false);
  });

  it('surfaces a non-deny engine failure instead of masking it as a missing session', async () => {
    await scaffold(8);
    await expect(
      run([{ exitCode: 1, stderr: 'Error: /upgrade to access this model' }]),
    ).rejects.toThrow(EngineError);
  });

  it('resumes the prior session on a second run in the same working directory', async () => {
    await scaffold(8);
    const first = new FakeRunner(
      artifactPath,
      [{ write: JSON.stringify({ verdict: 'pass' }) }],
      dir,
      true,
    );
    const firstReport: RunReport = await runRole({
      roleName: 'reviewer',
      task: 'assess the diff',
      workingDirectory: dir,
      model: null,
      runner: first,
      clock: (): number => 0,
    });
    const second = new FakeRunner(
      artifactPath,
      [{ write: JSON.stringify({ verdict: 'pass' }) }],
      dir,
    );
    const secondReport: RunReport = await runRole({
      roleName: 'reviewer',
      task: 'assess it again',
      workingDirectory: dir,
      model: null,
      runner: second,
      clock: (): number => 0,
    });

    const firstTurn = first.invocations.find((i) => i.args.includes('-p'));
    expect(firstTurn?.args).not.toContain('--resume');
    const secondTurn = second.invocations.find((i) => i.args.includes('-p'));
    expect(secondTurn?.args.slice(0, 2)).toEqual(['--resume', 's1']);
    expect(firstReport.sessionId).toBe('s1');
    expect(secondReport.sessionId).toBe('s1');
  });

  it('forwards a model override to the engine invocation over the role model', async () => {
    await scaffold(8, 'role-tier');
    const runner = new FakeRunner(
      artifactPath,
      [{ write: JSON.stringify({ verdict: 'pass' }) }],
      dir,
    );
    await runRole({
      roleName: 'reviewer',
      task: 'assess the diff',
      workingDirectory: dir,
      model: 'seat-tier',
      runner,
      clock: (): number => 0,
    });

    const turn = runner.invocations.find((i) => i.args.includes('-p'));
    expect(turn?.args).toContain('--model');
    expect(turn?.args).toContain('seat-tier');
    expect(turn?.args).not.toContain('role-tier');
  });

  it('falls back to the role model when no override is given', async () => {
    await scaffold(8, 'role-tier');
    const runner = new FakeRunner(
      artifactPath,
      [{ write: JSON.stringify({ verdict: 'pass' }) }],
      dir,
    );
    await runRole({
      roleName: 'reviewer',
      task: 'assess the diff',
      workingDirectory: dir,
      model: null,
      runner,
      clock: (): number => 0,
    });

    const turn = runner.invocations.find((i) => i.args.includes('-p'));
    expect(turn?.args).toContain('--model');
    expect(turn?.args).toContain('role-tier');
  });

  it('rejects an unknown role as a usage error before launching a session', async () => {
    await scaffold(8);
    await expect(
      runRole({
        roleName: 'ghost',
        task: 'x',
        workingDirectory: dir,
        model: null,
        runner: new FakeRunner(artifactPath, [], dir),
        clock: (): number => 0,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('rejects an empty task as a usage error', async () => {
    await scaffold(8);
    await expect(
      runRole({
        roleName: 'reviewer',
        task: '   ',
        workingDirectory: dir,
        model: null,
        runner: new FakeRunner(artifactPath, [], dir),
        clock: (): number => 0,
      }),
    ).rejects.toThrow(UsageError);
  });

  it('rejects a missing schema as a usage error before launch', async () => {
    await scaffold(8);
    await rm(join(dir, 'review.schema.json'), { force: true });
    await expect(
      run([{ write: JSON.stringify({ verdict: 'pass' }) }]),
    ).rejects.toThrow(UsageError);
  });

  function runWithRecorder(
    scripts: readonly TurnScript[],
    recorder: RunObserver,
  ): Promise<RunReport> {
    return runRole({
      roleName: 'reviewer',
      task: 'assess the diff',
      workingDirectory: dir,
      model: null,
      runner: new FakeRunner(artifactPath, scripts, dir),
      clock: (): number => 0,
      runId: 'run-fixed',
      recorder,
    });
  }

  it('records launch, turn, validation and terminal events for a happy-path run', async () => {
    await scaffold(8);
    const recorder = new RecordingObserver();
    await runWithRecorder(
      [{ write: JSON.stringify({ verdict: 'pass' }) }],
      recorder,
    );

    expect(recorder.types()).toEqual([
      'runLaunched',
      'turnCompleted',
      'artifactValidated',
      'terminalOutcome',
    ]);
    const launched = recorder.events[0];
    expect(launched?.type === 'runLaunched' && launched.runId).toBe(
      'run-fixed',
    );
    const turn = recorder.events[1];
    expect(turn?.type === 'turnCompleted' && turn.boundary).toBe('launch');
    const terminal = recorder.events[3];
    expect(terminal?.type === 'terminalOutcome' && terminal.succeeded).toBe(
      true,
    );
  });

  it('records a repair attempt and a resume turn on a repaired run', async () => {
    await scaffold(8);
    const recorder = new RecordingObserver();
    await runWithRecorder(
      [
        { write: JSON.stringify({ verdict: 7 }) },
        { write: JSON.stringify({ verdict: 'pass' }) },
      ],
      recorder,
    );

    expect(recorder.types()).toEqual([
      'runLaunched',
      'turnCompleted',
      'artifactValidated',
      'repairAttempted',
      'turnCompleted',
      'artifactValidated',
      'terminalOutcome',
    ]);
    const resumeTurn = recorder.events[4];
    expect(resumeTurn?.type === 'turnCompleted' && resumeTurn.boundary).toBe(
      'resume',
    );
  });

  it('records a failing terminal outcome carrying the failure tier', async () => {
    await scaffold(1);
    const recorder = new RecordingObserver();
    await runWithRecorder(
      [{ write: JSON.stringify({ verdict: 7 }) }],
      recorder,
    );

    const terminal = recorder.events.at(-1);
    expect(terminal?.type === 'terminalOutcome' && terminal.failureTier).toBe(
      'budget',
    );
  });

  it('embeds no engine payload or conversation content in any event', async () => {
    await scaffold(8);
    const recorder = new RecordingObserver();
    await runWithRecorder(
      [
        {
          write: JSON.stringify({ verdict: 'pass' }),
          stdout: 'SECRET_TRANSCRIPT_MARKER',
          stderr: 'SECRET_STDERR_MARKER',
        },
      ],
      recorder,
    );

    const serialized: string = JSON.stringify(recorder.events);
    expect(serialized).not.toContain('SECRET_TRANSCRIPT_MARKER');
    expect(serialized).not.toContain('SECRET_STDERR_MARKER');
  });

  it('closes the observer once the run finishes', async () => {
    await scaffold(8);
    const recorder = new RecordingObserver();
    await runWithRecorder(
      [{ write: JSON.stringify({ verdict: 'pass' }) }],
      recorder,
    );

    expect(recorder.closeCount).toBe(1);
  });
});
