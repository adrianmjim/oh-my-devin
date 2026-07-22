import { access } from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandInvocation } from '../engine/command-invocation';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from './create-e2e-project';
import type { E2eProject } from './e2e-project';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('createE2eProject', () => {
  let project: E2eProject | null = null;

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
