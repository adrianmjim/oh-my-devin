import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import type { DevinStubScript } from '../testing/devin-stub-script';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

interface JsonReport {
  readonly role: string;
  readonly outcome: string;
  readonly exitCode: number;
  readonly artifactValid: boolean;
  readonly failureTier: string | null;
}

function turn(stdout: string): CommandResult {
  return { stdout, stderr: '', exitCode: 0 };
}

const ONE_TURN: DevinStubScript = {
  turns: [turn('wrote review.json')],
  listResponse: turn('[]'),
};

const TWO_TURNS: DevinStubScript = {
  turns: [turn('working'), turn('still working')],
  listResponse: turn('[]'),
};

async function writeValidArtifact(dir: string): Promise<void> {
  await writeFile(
    join(dir, 'review.json'),
    JSON.stringify({ verdict: 'approve' }),
    'utf8',
  );
}

describe('omd run (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('completes a happy-path run and reports success', async () => {
    project = await createE2eProject();
    await project.run(['setup']);
    await project.writeScript(ONE_TURN);
    await writeValidArtifact(project.dir);

    const result: CommandResult = await project.run([
      'run',
      'reviewer',
      'review the diff',
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('omd run — success');
    expect(result.stdout).toContain('review.json (valid)');
  });

  it('surfaces the invalid-artifact failure and a non-zero exit', async () => {
    project = await createE2eProject();
    await project.run(['setup']);
    await project.writeScript(TWO_TURNS);

    const result: CommandResult = await project.run([
      'run',
      'reviewer',
      'review the diff',
    ]);

    expect(result.exitCode).toBe(3);
    expect(result.stdout).toContain('failure');
    expect(result.stdout).toContain('invalid artifact');
  });

  it('emits a machine-readable report under --json', async () => {
    project = await createE2eProject();
    await project.run(['setup']);
    await project.writeScript(ONE_TURN);
    await writeValidArtifact(project.dir);

    const result: CommandResult = await project.run([
      'run',
      'reviewer',
      'review the diff',
      '--json',
    ]);

    expect(result.exitCode).toBe(0);
    const report: JsonReport = JSON.parse(result.stdout) as JsonReport;
    expect(report.role).toBe('reviewer');
    expect(report.outcome).toBe('success');
    expect(report.exitCode).toBe(0);
    expect(report.artifactValid).toBe(true);
    expect(report.failureTier).toBeNull();
  });
});
