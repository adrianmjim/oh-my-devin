import { spawn } from 'node:child_process';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from './create-e2e-project';
import type { E2eProject } from './e2e-project';

const REPO_ROOT: string = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);
const CLI_PATH: string = resolve(REPO_ROOT, 'dist', 'cli.js');

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function build(): Promise<void> {
  return new Promise<void>(
    (resolve_: () => void, reject: (error: Error) => void): void => {
      const child: ChildProcessWithoutNullStreams = spawn(
        'pnpm',
        ['run', 'build'],
        { cwd: REPO_ROOT },
      );
      let stderr: string = '';
      child.stderr.on('data', (chunk: Buffer): void => {
        stderr += chunk.toString();
      });
      child.on('error', reject);
      child.on('close', (code: number | null): void => {
        if (code === 0) {
          resolve_();
        } else {
          reject(new Error(`pnpm run build failed (${code ?? -1}): ${stderr}`));
        }
      });
    },
  );
}

describe('createE2eProject', () => {
  let project: E2eProject | null = null;

  beforeAll(async () => {
    if (!(await exists(CLI_PATH))) {
      await build();
    }
  }, 180000);

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('provisions an isolated project directory', async () => {
    project = await createE2eProject();
    expect(await exists(project.dir)).toBe(true);

    const other: E2eProject = await createE2eProject();
    expect(other.dir).not.toBe(project.dir);
    await other.cleanup();
  });

  it('spawns the built CLI and captures exit code and stdout', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('omd — an organizational layer');
  });

  it('reports a non-zero exit and stderr for an unknown command', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run([
      'definitely-not-a-command',
    ]);

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  it('prepends the stub bin so omd resolves devin to the stub', async () => {
    project = await createE2eProject();
    await project.writeScript({
      turns: [
        { stdout: '3000.1.27', stderr: '', exitCode: 0 },
        { stdout: '', stderr: '', exitCode: 0 },
      ],
      listResponse: { stdout: '[]', stderr: '', exitCode: 0 },
    });

    const result: CommandResult = await project.run(['doctor']);
    const invocations: readonly CommandInvocation[] =
      await project.readInvocations();

    expect(result.exitCode).toBe(0);
    expect(invocations.length).toBeGreaterThan(0);
    expect(
      invocations.every(
        (invocation: CommandInvocation): boolean =>
          invocation.command === 'devin',
      ),
    ).toBe(true);
  });

  it('feeds provided stdin lines without hanging', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['--help'], {
      stdin: ['ignored'],
    });

    expect(result.exitCode).toBe(0);
  });
});
