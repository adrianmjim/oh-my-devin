import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import type { DevinStubScript } from './devin-stub-script';
import type { E2eProject } from './e2e-project';
import type { E2eRunOptions } from './e2e-run-options';
import {
  STUB_LOG_ENV,
  STUB_SCRIPT_ENV,
  writeDevinStubBin,
} from './write-devin-stub-bin';

const CLI_PATH: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'dist',
  'cli.js',
);

const EMPTY_SCRIPT: DevinStubScript = { turns: [], listResponse: null };

export async function createE2eProject(): Promise<E2eProject> {
  const root: string = await mkdtemp(join(tmpdir(), 'omd-e2e-'));
  const dir: string = join(root, 'project');
  const binDir: string = join(root, 'bin');
  const scriptPath: string = join(root, 'devin-script.json');
  const logPath: string = join(root, 'devin-invocations.jsonl');

  await mkdir(dir, { recursive: true });
  await writeDevinStubBin(binDir);
  await writeFile(scriptPath, JSON.stringify(EMPTY_SCRIPT), 'utf8');

  async function writeScript(script: DevinStubScript): Promise<void> {
    await writeFile(scriptPath, JSON.stringify(script), 'utf8');
  }

  function run(
    argv: readonly string[],
    options?: E2eRunOptions,
  ): Promise<CommandResult> {
    return new Promise<CommandResult>(
      (
        resolvePromise: (result: CommandResult) => void,
        reject: (error: Error) => void,
      ): void => {
        const pathValue: string = `${binDir}${delimiter}${process.env['PATH'] ?? ''}`;
        const child: ChildProcessWithoutNullStreams = spawn(
          process.execPath,
          [CLI_PATH, ...argv],
          {
            cwd: dir,
            env: {
              ...process.env,
              PATH: pathValue,
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
          resolvePromise({ stdout, stderr, exitCode: code ?? 1 });
        });
        child.stdin.on('error', (error: Error): void => {
          const streamError: NodeJS.ErrnoException = error;
          if (streamError.code !== 'EPIPE') {
            reject(error);
          }
        });
        const lines: readonly string[] = options?.stdin ?? [];
        for (const line of lines) {
          child.stdin.write(`${line}\n`);
        }
        child.stdin.end();
      },
    );
  }

  async function readInvocations(): Promise<readonly CommandInvocation[]> {
    let raw: string;
    try {
      raw = await readFile(logPath, 'utf8');
    } catch {
      return [];
    }
    return raw
      .split('\n')
      .filter((line: string): boolean => line.trim() !== '')
      .map(
        (line: string): CommandInvocation =>
          JSON.parse(line) as CommandInvocation,
      );
  }

  async function cleanup(): Promise<void> {
    await rm(root, { recursive: true, force: true });
  }

  return { dir, logPath, writeScript, run, readInvocations, cleanup };
}
