import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';

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

interface JsonReport {
  readonly role: string;
  readonly outcome: string;
  readonly exitCode: number;
  readonly turnsUsed: number;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
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

describe.runIf(smokeEnabled)("omd's own flows smoke suite", () => {
  let scratchDir: string;

  beforeAll(async () => {
    scratchDir = await mkdtemp(join(tmpdir(), 'omd-flows-smoke-'));
  });

  afterAll(async () => {
    await rm(scratchDir, { recursive: true, force: true });
  });

  it('runs only when OMD_SMOKE=1 is set', () => {
    expect(smokeEnabled).toBe(true);
  });

  it(
    'installs the in-session layer into a scratch project',
    async () => {
      const result: CommandResult = await runOmd(scratchDir, ['setup']);
      expect(result.exitCode, result.stderr).toBe(0);
      expect(await exists(join(scratchDir, 'AGENTS.md'))).toBe(true);
      expect(
        await exists(
          join(scratchDir, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
        ),
      ).toBe(true);
      expect(
        await exists(
          join(scratchDir, '.devin', 'agents', 'reviewer', 'AGENT.md'),
        ),
      ).toBe(true);
    },
    SETUP_TIMEOUT_MS,
  );

  it(
    'probes the delegation hinge headlessly against the real CLI',
    async () => {
      const result: CommandResult = await runOmd(scratchDir, [
        'run',
        'reviewer',
        'Reply with the single word ok. Do not modify any files.',
        '--json',
      ]);
      const report: JsonReport = JSON.parse(result.stdout) as JsonReport;
      expect(report.role).toBe('reviewer');
      expect(report.turnsUsed).toBeGreaterThanOrEqual(1);
    },
    RUN_TIMEOUT_MS,
  );

  it(
    'completes one real single-role run roundtrip',
    async () => {
      const result: CommandResult = await runOmd(scratchDir, [
        'run',
        'reviewer',
        'Assess the empty diff and write {"verdict":"approve"} to review.json.',
        '--json',
      ]);
      const report: JsonReport = JSON.parse(result.stdout) as JsonReport;
      expect(report.role).toBe('reviewer');
      expect(report.exitCode).toBe(result.exitCode);
      expect(['success', 'failure']).toContain(report.outcome);
    },
    RUN_TIMEOUT_MS,
  );
});
