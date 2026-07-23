import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { JsonRunSnapshot } from '../observability/json-run-snapshot';

const smokeEnabled: boolean = process.env['OMD_SMOKE'] === '1';

const CLI_PATH: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'dist',
  'cli.js',
);

const SETUP_TIMEOUT_MS: number = 60000;
const RUN_TIMEOUT_MS: number = 600000;
const POLL_INTERVAL_MS: number = 5000;
const MAX_POLLS: number = 120;

const TERMINAL_STATES: readonly string[] = ['succeeded', 'failed'];

const SNAPSHOT_FIELDS: readonly string[] = [
  'artifactPath',
  'artifactValid',
  'currentStage',
  'failureTier',
  'lastEventAt',
  'maxTurns',
  'pendingGate',
  'runId',
  'runKind',
  'state',
  'subject',
  'turnsUsed',
];

const READ_ONLY_TASK: string =
  'Reply with the single word ok. Do not modify any files.';

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

function runOmd(cwd: string, argv: readonly string[]): Promise<CommandResult> {
  return new Promise<CommandResult>(
    (
      resolvePromise: (result: CommandResult) => void,
      reject: (error: Error) => void,
    ): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        process.execPath,
        [CLI_PATH, ...argv],
        { cwd },
      );
      let stdout: string = '';
      let stderr: string = '';
      child.stdout.on('data', (chunk: Buffer): void => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer): void => {
        stderr += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (code: number | null): void => {
        resolvePromise({ stdout, stderr, exitCode: code ?? 1 });
      });
      child.stdin.end();
    },
  );
}

async function pollToTerminal(
  cwd: string,
  runId: string,
): Promise<JsonRunSnapshot> {
  let last: JsonRunSnapshot | null = null;
  for (let attempt: number = 0; attempt < MAX_POLLS; attempt += 1) {
    const status: CommandResult = await runOmd(cwd, [
      'status',
      runId,
      '--json',
    ]);
    if (status.exitCode === 0) {
      const snapshot: JsonRunSnapshot = JSON.parse(
        status.stdout,
      ) as JsonRunSnapshot;
      last = snapshot;
      if (TERMINAL_STATES.includes(snapshot.state)) {
        return snapshot;
      }
    }
    await delay(POLL_INTERVAL_MS);
  }
  throw new Error(
    `run ${runId} did not reach a terminal state (last: ${last?.state ?? 'none'})`,
  );
}

describe('omd run --detach observability smoke suite', () => {
  it('requires OMD_SMOKE=1 to run the smoke tier', () => {
    expect(smokeEnabled).toBe(true);
  });

  describe.runIf(smokeEnabled)('against the installed Devin CLI', () => {
    let scratchDir: string;

    beforeAll(async () => {
      scratchDir = await mkdtemp(join(tmpdir(), 'omd-observability-smoke-'));
      await runOmd(scratchDir, ['setup']);
    }, SETUP_TIMEOUT_MS);

    afterAll(async () => {
      await rm(scratchDir, { recursive: true, force: true });
    });

    it(
      'prints an identity at launch, records a journal, and resolves through status',
      async () => {
        const launch: CommandResult = await runOmd(scratchDir, [
          'run',
          'reviewer',
          READ_ONLY_TASK,
          '--detach',
        ]);
        expect(launch.exitCode, launch.stderr).toBe(0);
        const runId: string = launch.stdout.trim();
        expect(runId.length).toBeGreaterThan(0);

        const snapshot: JsonRunSnapshot = await pollToTerminal(
          scratchDir,
          runId,
        );
        expect(snapshot.runId).toBe(runId);
        expect(TERMINAL_STATES).toContain(snapshot.state);

        expect(
          await exists(join(scratchDir, '.omd', 'runs', runId, 'events.jsonl')),
        ).toBe(true);

        expect(Object.keys(snapshot).sort()).toEqual(
          [...SNAPSHOT_FIELDS].sort(),
        );
        expect(JSON.stringify(snapshot).length).toBeLessThan(2000);
      },
      RUN_TIMEOUT_MS,
    );

    it(
      'keeps the run alive after the invoking process has ended',
      async () => {
        const launch: CommandResult = await runOmd(scratchDir, [
          'run',
          'reviewer',
          READ_ONLY_TASK,
          '--detach',
        ]);
        expect(launch.exitCode, launch.stderr).toBe(0);
        const runId: string = launch.stdout.trim();

        const snapshot: JsonRunSnapshot = await pollToTerminal(
          scratchDir,
          runId,
        );
        expect(snapshot.runId).toBe(runId);
        expect(TERMINAL_STATES).toContain(snapshot.state);
      },
      RUN_TIMEOUT_MS,
    );
  });
});
