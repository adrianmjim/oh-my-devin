import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

interface RoleListEntry {
  readonly name: string;
  readonly output: string;
}

interface RoleContract {
  readonly name: string;
  readonly output: string;
}

const SEED_ROLES: readonly string[] = ['architect', 'executor', 'reviewer'];

describe('omd roles (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('lists the installed roles in text and json', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    const text: CommandResult = await project.run(['roles', 'list']);
    expect(text.exitCode).toBe(0);
    expect(text.stdout).toContain('reviewer');

    const json: CommandResult = await project.run(['roles', 'list', '--json']);
    expect(json.exitCode).toBe(0);
    const entries: readonly RoleListEntry[] = JSON.parse(
      json.stdout,
    ) as readonly RoleListEntry[];
    const reviewer: RoleListEntry | undefined = entries.find(
      (entry: RoleListEntry): boolean => entry.name === 'reviewer',
    );
    expect(reviewer).toBeDefined();
    expect(reviewer?.output).toBe('review.json');
  });

  it('lists the installed roles with distinct summaries free of region markers', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    const text: CommandResult = await project.run(['roles', 'list']);
    expect(text.exitCode).toBe(0);
    expect(text.stdout).not.toContain('omd:begin');
    expect(text.stdout).not.toContain('omd:end');

    const summaries: readonly string[] = SEED_ROLES.map(
      (name: string): string => {
        const line: string | undefined = text.stdout
          .split('\n')
          .find((candidate: string): boolean =>
            candidate.startsWith(`${name} `),
          );
        expect(line).toBeDefined();
        return (line ?? '').slice(name.length).trim();
      },
    );
    for (const summary of summaries) {
      expect(summary.length).toBeGreaterThan(0);
      expect(summary.startsWith('#')).toBe(false);
    }
    expect(new Set(summaries).size).toBe(SEED_ROLES.length);
  });

  it('shows a role contract in text and json', async () => {
    project = await createE2eProject();
    await project.run(['setup']);

    const text: CommandResult = await project.run([
      'roles',
      'show',
      'reviewer',
    ]);
    expect(text.exitCode).toBe(0);
    expect(text.stdout).toContain('name:');
    expect(text.stdout).toContain('reviewer');
    expect(text.stdout).toContain('review.json');

    const json: CommandResult = await project.run([
      'roles',
      'show',
      'reviewer',
      '--json',
    ]);
    expect(json.exitCode).toBe(0);
    const contract: RoleContract = JSON.parse(json.stdout) as RoleContract;
    expect(contract.name).toBe('reviewer');
    expect(contract.output).toBe('review.json');
  });
});
