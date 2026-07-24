import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
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
});
