import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { DevinStubScript } from './devin-stub-script';
import {
  STUB_LOG_ENV,
  STUB_SCRIPT_ENV,
  writeDevinStubBin,
} from './write-devin-stub-bin';

interface StubRun {
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}

interface LogRecord {
  readonly command: string;
  readonly args: readonly string[];
}

function turn(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

describe('writeDevinStubBin', () => {
  let dir: string;
  let binPath: string;
  let scriptPath: string;
  let logPath: string;

  function runStub(args: readonly string[]): Promise<StubRun> {
    return new Promise<StubRun>(
      (
        resolve: (run: StubRun) => void,
        reject: (error: Error) => void,
      ): void => {
        const child: ChildProcessWithoutNullStreams = spawn(
          binPath,
          [...args],
          {
            env: {
              ...process.env,
              [STUB_SCRIPT_ENV]: scriptPath,
              [STUB_LOG_ENV]: logPath,
            },
          },
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
          resolve({ stdout, stderr, exitCode: code ?? 0 });
        });
      },
    );
  }

  async function writeScript(script: DevinStubScript): Promise<void> {
    await writeFile(scriptPath, JSON.stringify(script), 'utf8');
  }

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-stub-bin-'));
    scriptPath = join(dir, 'script.json');
    logPath = join(dir, 'invocations.jsonl');
    binPath = await writeDevinStubBin(join(dir, 'bin'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('replays scripted turns in FIFO order across -p and --resume -p', async () => {
    await writeScript({
      turns: [turn('first'), turn('second')],
      listResponse: null,
    });

    const first: StubRun = await runStub(['-p', 'do it']);
    const second: StubRun = await runStub(['--resume', 's1', '-p', 'again']);

    expect(first.stdout).toBe('first');
    expect(first.exitCode).toBe(0);
    expect(second.stdout).toBe('second');
  });

  it('answers a list --format json invocation with the scripted list response', async () => {
    await writeScript({ turns: [], listResponse: turn('[{"id":"s1"}]') });

    const listed: StubRun = await runStub(['list', '--format', 'json']);

    expect(listed.stdout).toBe('[{"id":"s1"}]');
  });

  it('plays queued list responses before falling back to the standing one', async () => {
    await writeScript({
      turns: [],
      listResponse: turn('[{"id":"later"}]'),
      listResponses: [turn('[]')],
    });

    const first: StubRun = await runStub(['list', '--format', 'json']);
    const second: StubRun = await runStub(['list', '--format', 'json']);

    expect(first.stdout).toBe('[]');
    expect(second.stdout).toBe('[{"id":"later"}]');
  });

  it('propagates a scripted non-zero exit code and stderr', async () => {
    await writeScript({
      turns: [{ stdout: 'partial', stderr: 'boom', exitCode: 3 }],
      listResponse: null,
    });

    const result: StubRun = await runStub(['-p', 'fail please']);

    expect(result.exitCode).toBe(3);
    expect(result.stderr).toBe('boom');
    expect(result.stdout).toBe('partial');
  });

  it('appends every invocation as a JSONL record to the log file', async () => {
    await writeScript({
      turns: [turn('a'), turn('b')],
      listResponse: turn('[]'),
    });

    await runStub(['-p', 'first']);
    await runStub(['list', '--format', 'json']);
    await runStub(['--resume', 'sX', '-p', 'second']);

    const log: string = await readFile(logPath, 'utf8');
    const records: LogRecord[] = log
      .split('\n')
      .filter((line: string): boolean => line.trim() !== '')
      .map((line: string): LogRecord => JSON.parse(line) as LogRecord);

    expect(records).toHaveLength(3);
    expect(records[0]).toEqual({ command: 'devin', args: ['-p', 'first'] });
    expect(records[1]).toEqual({
      command: 'devin',
      args: ['list', '--format', 'json'],
    });
    expect(records[2]).toEqual({
      command: 'devin',
      args: ['--resume', 'sX', '-p', 'second'],
    });
  });
});
