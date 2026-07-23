import { access, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { JsonRunSnapshot } from '../observability/json-run-snapshot';
import { RunRecordPaths } from '../observability/run-record-paths';
import { createE2eProject } from '../testing/create-e2e-project';
import type { DevinStubScript } from '../testing/devin-stub-script';
import type { E2eProject } from '../testing/e2e-project';

function turn(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

const ONE_TURN: DevinStubScript = {
  turns: [turn('wrote review.json')],
  listResponse: turn('[]'),
};

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise<void>((resolvePromise): void => {
    setTimeout(resolvePromise, ms);
  });
}

const TERMINAL_STATES: readonly string[] = ['succeeded', 'failed'];

describe('omd run --detach (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  async function pollToTerminal(
    active: E2eProject,
    runId: string,
  ): Promise<JsonRunSnapshot> {
    for (let attempt: number = 0; attempt < 60; attempt += 1) {
      const status: CommandResult = await active.run([
        'status',
        runId,
        '--json',
      ]);
      if (status.exitCode === 0) {
        const snapshot: JsonRunSnapshot = JSON.parse(
          status.stdout,
        ) as JsonRunSnapshot;
        if (TERMINAL_STATES.includes(snapshot.state)) {
          return snapshot;
        }
      }
      await delay(250);
    }
    throw new Error(`run ${runId} did not reach a terminal state`);
  }

  it('prints a run identity, exits 0, and records under .omd/runs/<runId>', async () => {
    project = await createE2eProject();
    await project.run(['setup']);
    await project.writeScript(ONE_TURN);
    await writeFile(
      join(project.dir, 'review.json'),
      JSON.stringify({ verdict: 'approve' }),
      'utf8',
    );

    const result: CommandResult = await project.run([
      'run',
      'reviewer',
      'review the diff',
      '--detach',
    ]);

    expect(result.exitCode).toBe(0);
    const runId: string = result.stdout.trim();
    expect(runId.length).toBeGreaterThan(0);

    const paths = new RunRecordPaths(project.dir, runId);
    const snapshot: JsonRunSnapshot = await pollToTerminal(project, runId);
    expect(snapshot.runId).toBe(runId);
    expect(snapshot.state).toBe('succeeded');
    expect(await exists(paths.journal)).toBe(true);
  });

  it('rejects an unresolvable role before assigning an identity, exit 64', async () => {
    project = await createE2eProject();
    await project.run(['setup']);
    await project.writeScript(ONE_TURN);

    const result: CommandResult = await project.run([
      'run',
      'ghost',
      'review the diff',
      '--detach',
    ]);

    expect(result.exitCode).toBe(64);
    expect(result.stderr).toContain('usage error');
    expect(result.stdout).toBe('');
  });
});
