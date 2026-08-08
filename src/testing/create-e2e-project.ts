import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import type { AgentConfigBundle } from '../contract/agent-config-bundle';
import type { CommandInvocation } from '../engine/command-invocation';
import { AGENT_CONFIG_LOG_SUFFIX } from './agent-config-log-suffix';
import type { CommandResult } from '../engine/command-result';
import { CLI_PATH } from './cli-path';
import type { DevinStubScript } from './devin-stub-script';
import type { E2eProject } from './e2e-project';
import type { E2eRunOptions } from './e2e-run-options';
import { EMPTY_STUB_SCRIPT } from './empty-stub-script';
import { STUB_LOG_ENV } from './stub-log-env';
import { STUB_SCRIPT_ENV } from './stub-script-env';
import { writeDevinStubBin } from './write-devin-stub-bin';
import { writeOmdShimBin } from './write-omd-shim-bin';

export async function createE2eProject(): Promise<E2eProject> {
  const root: string = await mkdtemp(join(tmpdir(), 'omd-e2e-'));
  const dir: string = join(root, 'project');
  const binDir: string = join(root, 'bin');
  const scriptPath: string = join(root, 'devin-script.json');
  const logPath: string = join(root, 'devin-invocations.jsonl');

  await mkdir(dir, { recursive: true });
  await writeDevinStubBin(binDir);
  await writeOmdShimBin(binDir);
  await writeFile(scriptPath, JSON.stringify(EMPTY_STUB_SCRIPT), 'utf8');

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
              ...(options?.env ?? {}),
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

  async function readHandedBundles(): Promise<readonly AgentConfigBundle[]> {
    let raw: string;
    try {
      raw = await readFile(`${logPath}${AGENT_CONFIG_LOG_SUFFIX}`, 'utf8');
    } catch {
      return [];
    }
    return raw
      .split('\n')
      .filter((line: string): boolean => line.trim() !== '')
      .map(
        (line: string): AgentConfigBundle =>
          JSON.parse(line) as AgentConfigBundle,
      );
  }

  async function cleanup(): Promise<void> {
    await rm(root, { recursive: true, force: true });
  }

  return {
    dir,
    binDir,
    logPath,
    writeScript,
    run,
    readInvocations,
    readHandedBundles,
    cleanup,
  };
}
