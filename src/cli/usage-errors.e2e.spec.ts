import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { ALL_LAYER_COMPONENTS } from '../layer/all-layer-components';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

const USAGE_ERROR_EXIT_CODE: number = 64;

describe('omd usage and error rendering (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('rejects an unknown command with the usage-error exit code', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run([
      'definitely-not-a-command',
    ]);

    expect(result.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
    expect(result.stderr).toContain('usage error');
    expect(result.stderr).toContain('unknown command');
  });

  it('reports the run usage line when required arguments are missing', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['run']);

    expect(result.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
    expect(result.stderr).toContain('usage: omd run');
  });

  it('reports the roles usage line when show is missing its role', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['roles', 'show']);

    expect(result.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
    expect(result.stderr).toContain('usage: omd roles show');
  });

  it('reports the team usage line when required arguments are missing', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['team', 'run']);

    expect(result.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
    expect(result.stderr).toContain('usage: omd team run');
  });

  it('rejects a space-separated setup argument with the usage-error exit code', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run([
      'setup',
      '--level',
      'user',
    ]);

    expect(result.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
    expect(result.stderr).toContain('usage error');
    expect(result.stderr).toContain('usage: omd setup');
  });

  it('rejects an unknown setup flag with the usage-error exit code', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['setup', '--levl=user']);

    expect(result.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
    expect(result.stderr).toContain('usage: omd setup');
  });

  it('rejects a role declaring an unknown memory class before launching a session', async () => {
    project = await createE2eProject();
    const roleDir: string = join(project.dir, '.devin', 'agents', 'oracle');
    await mkdir(roleDir, { recursive: true });
    await writeFile(
      join(roleDir, 'AGENT.md'),
      [
        '---',
        'omd-output: oracle.json',
        'omd-schema: oracle.schema.json',
        'omd-max-turns: 3',
        'omd-memory:',
        '  - transcripts',
        '---',
        'You are the oracle.',
      ].join('\n'),
      'utf8',
    );
    await writeFile(
      join(project.dir, 'oracle.schema.json'),
      JSON.stringify({ type: 'object' }),
      'utf8',
    );

    const result: CommandResult = await project.run([
      'run',
      'oracle',
      'foresee',
    ]);

    expect(result.exitCode).toBe(USAGE_ERROR_EXIT_CODE);
    expect(result.stderr).toContain('omd-memory');
    expect(await project.readInvocations()).toEqual([]);
  });

  it('prints the usage text for --help with a zero exit code', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['--help']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      'omd — an organizational layer over the Devin CLI',
    );
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('[--detach]');
  });

  it('names every scope component in the setup usage line', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['--help']);

    expect(result.exitCode).toBe(0);
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(result.stdout).toContain(component);
    }
  });
});
