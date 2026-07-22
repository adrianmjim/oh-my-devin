import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { DevinStubScript } from '../testing/devin-stub-script';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

function result(stdout: string, exitCode: number): CommandResult {
  return { stdout, stderr: '', exitCode };
}

const CONFORMING_STUB: DevinStubScript = {
  turns: [result('devin 3000.1.27', 0), result('', 0)],
  listResponse: result('[]', 0),
};

describe('omd doctor (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('reports success against a conforming scripted stub', async () => {
    project = await createE2eProject();
    await project.writeScript(CONFORMING_STUB);

    const run: CommandResult = await project.run(['doctor']);

    expect(run.exitCode).toBe(0);
    expect(run.stdout).toContain('[pass] devin-cli');
    expect(run.stdout).toContain('[pass] headless-surface');
    expect(run.stdout).not.toContain('[fail]');
  });

  it('reports a non-failing version-drift warning when the stub version differs from the pin', async () => {
    project = await createE2eProject();
    await project.writeScript({
      turns: [result('devin 3000.9.0', 0), result('', 0)],
      listResponse: result('[]', 0),
    });

    const run: CommandResult = await project.run(['doctor']);

    expect(run.exitCode).toBe(0);
    expect(run.stdout).toContain('[warn] devin-version');
    expect(run.stdout).not.toContain('[fail]');
  });

  it('reports the documented failure when the stub returns malformed list output', async () => {
    project = await createE2eProject();
    await project.writeScript({
      turns: [result('devin 3000.1.27', 0), result('', 0)],
      listResponse: result('not json at all', 0),
    });

    const run: CommandResult = await project.run(['doctor']);

    expect(run.exitCode).toBe(1);
    expect(run.stdout).toContain('[fail] headless-surface');
  });
});
