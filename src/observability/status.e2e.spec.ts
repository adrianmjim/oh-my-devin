import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';
import type { JsonRunSnapshot } from './json-run-snapshot';
import { JournalWriter } from './journal-writer';
import type { ProgressEvent } from './progress-event';
import { RunRecordPaths } from './run-record-paths';
import { writeLivenessStamp } from './write-liveness-stamp';

function singleRoleLaunched(runId: string): ProgressEvent {
  return {
    type: 'runLaunched',
    timestamp: 1000,
    runId,
    runKind: 'single-role',
    subject: 'reviewer',
    maxTurns: 8,
    artifactPath: 'review.json',
  };
}

describe('omd status (e2e)', () => {
  let project: E2eProject | undefined;

  afterEach(async (): Promise<void> => {
    await project?.cleanup();
  });

  async function seed(
    runId: string,
    events: readonly ProgressEvent[],
    stampedAt: number | null,
  ): Promise<void> {
    if (project === undefined) {
      throw new Error('project not initialised');
    }
    const paths = new RunRecordPaths(project.dir, runId);
    const writer = new JournalWriter(paths.journal);
    for (const event of events) {
      await writer.append(event);
    }
    if (stampedAt !== null) {
      await writeLivenessStamp(paths.liveness, stampedAt);
    }
  }

  it('renders a running snapshot and exits 0', async () => {
    project = await createE2eProject();
    await seed(
      'run-live',
      [
        singleRoleLaunched('run-live'),
        {
          type: 'turnCompleted',
          timestamp: 2000,
          turnIndex: 0,
          boundary: 'launch',
        },
      ],
      Date.now(),
    );

    const result: CommandResult = await project.run(['status', 'run-live']);

    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain('omd status — running');
    expect(result.stdout).toContain('run-live');
  });

  it('renders a stalled snapshot for a cold run and still exits 0', async () => {
    project = await createE2eProject();
    await seed('run-cold', [singleRoleLaunched('run-cold')], 1);

    const result: CommandResult = await project.run(['status', 'run-cold']);

    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain('omd status — stalled');
  });

  it('reports the awaiting-gate state and names the gate, exiting 0', async () => {
    project = await createE2eProject();
    await seed(
      'run-gate',
      [
        {
          type: 'runLaunched',
          timestamp: 1000,
          runId: 'run-gate',
          runKind: 'pipeline',
          subject: 'feature-team',
          maxTurns: 0,
          artifactPath: null,
        },
        {
          type: 'stageStarted',
          timestamp: 2000,
          stage: 'architect',
          stageIndex: 0,
        },
        { type: 'gateWaitEntered', timestamp: 2200, stage: 'architect' },
      ],
      Date.now(),
    );

    const result: CommandResult = await project.run(['status', 'run-gate']);

    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain('omd status — awaiting-gate');
    expect(result.stdout).toContain('architect');
  });

  it('reports a failed run and still exits 0', async () => {
    project = await createE2eProject();
    await seed(
      'run-fail',
      [
        singleRoleLaunched('run-fail'),
        {
          type: 'terminalOutcome',
          timestamp: 3000,
          succeeded: false,
          failureTier: 'invalid_artifact',
        },
      ],
      Date.now(),
    );

    const result: CommandResult = await project.run(['status', 'run-fail']);

    expect(result.exitCode, result.stderr).toBe(0);
    expect(result.stdout).toContain('omd status — failed');
    expect(result.stdout).toContain('invalid_artifact');
  });

  it('rejects an unknown run identity with a usage error and exit 64', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['status', 'ghost']);

    expect(result.exitCode).toBe(64);
    expect(result.stderr).toContain('usage error');
    expect(result.stdout).toBe('');
  });

  it('emits machine-readable JSON under --json', async () => {
    project = await createE2eProject();
    await seed('run-json', [singleRoleLaunched('run-json')], Date.now());

    const result: CommandResult = await project.run([
      'status',
      'run-json',
      '--json',
    ]);

    expect(result.exitCode, result.stderr).toBe(0);
    const snapshot: JsonRunSnapshot = JSON.parse(
      result.stdout,
    ) as JsonRunSnapshot;
    expect(snapshot.runId).toBe('run-json');
    expect(snapshot.state).toBe('running');
    expect(snapshot.runKind).toBe('single-role');
  });
});
