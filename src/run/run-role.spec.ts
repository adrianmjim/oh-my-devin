import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { CommandRunner } from '../engine/command-runner';
import { EngineError } from '../engine/engine-error';
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
  private index = 0;

  public constructor(
    private readonly artifactPath: string,
    private readonly scripts: readonly TurnScript[],
    private readonly workingDirectory: string,
  ) {}

  public async run(inv: CommandInvocation): Promise<CommandResult> {
    if (inv.args.includes('list')) {
      return {
        stdout: JSON.stringify([
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

describe('runRole', () => {
  let dir: string;
  let artifactPath: string;

  async function scaffold(maxTurns: number): Promise<void> {
    const roleDir: string = join(dir, '.devin', 'agents', 'reviewer');
    await mkdir(roleDir, { recursive: true });
    const agentMd: string = [
      '---',
      'omd-output: review.json',
      'omd-schema: review.schema.json',
      `omd-max-turns: ${maxTurns}`,
      '---',
      'You are the reviewer.',
    ].join('\n');
    await writeFile(join(roleDir, 'AGENT.md'), agentMd, 'utf8');
    await writeFile(join(dir, 'review.schema.json'), JSON.stringify(SCHEMA));
  }

  function run(scripts: readonly TurnScript[]): Promise<RunReport> {
    return runRole({
      roleName: 'reviewer',
      task: 'assess the diff',
      workingDirectory: dir,
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

  it('rejects an unknown role as a usage error before launching a session', async () => {
    await scaffold(8);
    await expect(
      runRole({
        roleName: 'ghost',
        task: 'x',
        workingDirectory: dir,
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
});
