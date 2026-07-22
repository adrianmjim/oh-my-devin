import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

describe('omd setup (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('writes the rules file, role definitions, skills, and hooks by default', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['setup']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Installed');
    expect(await exists(join(project.dir, 'AGENTS.md'))).toBe(true);
    expect(
      await exists(
        join(project.dir, '.devin', 'agents', 'reviewer', 'AGENT.md'),
      ),
    ).toBe(true);
    expect(
      await exists(
        join(project.dir, '.devin', 'schemas', 'review.schema.json'),
      ),
    ).toBe(true);
    expect(
      await exists(
        join(project.dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      ),
    ).toBe(true);
    expect(
      await exists(join(project.dir, '.devin', 'skills', 'team', 'SKILL.md')),
    ).toBe(true);
    expect(await exists(join(project.dir, '.devin', 'hooks.v1.json'))).toBe(
      true,
    );
    expect(
      await exists(join(project.dir, '.devin', 'hooks', 'omd-mode.mjs')),
    ).toBe(true);
  });

  it('writes exactly the named components under a scope and no other', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['setup', '--scope=rules']);

    expect(result.exitCode).toBe(0);
    expect(await exists(join(project.dir, 'AGENTS.md'))).toBe(true);
    expect(await exists(join(project.dir, '.devin'))).toBe(false);
  });

  it('installs only skills when scoped to skills', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run([
      'setup',
      '--scope=skills',
    ]);

    expect(result.exitCode).toBe(0);
    expect(
      await exists(
        join(project.dir, '.devin', 'skills', 'omd-delegate', 'SKILL.md'),
      ),
    ).toBe(true);
    expect(await exists(join(project.dir, 'AGENTS.md'))).toBe(false);
    expect(await exists(join(project.dir, '.devin', 'agents'))).toBe(false);
    expect(await exists(join(project.dir, '.devin', 'hooks.v1.json'))).toBe(
      false,
    );
  });
});
