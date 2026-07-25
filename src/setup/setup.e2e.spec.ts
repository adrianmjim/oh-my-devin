import { access, readFile } from 'node:fs/promises';
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
    expect(result.stdout).toContain('Created:');
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
      await exists(
        join(project.dir, '.devin', 'skills', 'omd-install', 'SKILL.md'),
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

  it('installs the canonical trio, their schemas, and the default team on a full install', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['setup']);

    expect(result.exitCode).toBe(0);
    for (const role of ['architect', 'executor', 'reviewer']) {
      expect(
        await exists(join(project.dir, '.devin', 'agents', role, 'AGENT.md')),
        role,
      ).toBe(true);
    }
    for (const schema of [
      'architecture.schema.json',
      'evidence.schema.json',
      'review.schema.json',
    ]) {
      expect(
        await exists(join(project.dir, '.devin', 'schemas', schema)),
        schema,
      ).toBe(true);
    }
    expect(
      await exists(join(project.dir, '.devin', 'teams', 'default.yaml')),
    ).toBe(true);
  });

  it('writes only the default team declaration when scoped to teams', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['setup', '--scope=teams']);

    expect(result.exitCode).toBe(0);
    expect(
      await exists(join(project.dir, '.devin', 'teams', 'default.yaml')),
    ).toBe(true);
    expect(await exists(join(project.dir, 'AGENTS.md'))).toBe(false);
    expect(await exists(join(project.dir, '.devin', 'agents'))).toBe(false);
    expect(await exists(join(project.dir, '.devin', 'skills'))).toBe(false);
    expect(await exists(join(project.dir, '.devin', 'hooks.v1.json'))).toBe(
      false,
    );
  });

  it('never prompts or waits for input in a headless run', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['setup']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain('Install level?');
    expect(result.stdout).not.toContain('Component scope?');
  });

  it('installs a user-level file-drop into the config dir per the flags', async () => {
    project = await createE2eProject();
    const xdg: string = join(project.dir, 'xdg');

    const result: CommandResult = await project.run(
      ['setup', '--level=user', '--scope=roles,skills'],
      { env: { XDG_CONFIG_HOME: xdg } },
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).not.toContain('Install level?');
    expect(
      await exists(join(xdg, 'devin', 'agents', 'reviewer', 'AGENT.md')),
    ).toBe(true);
    expect(
      await exists(join(xdg, 'devin', 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(true);
    expect(await exists(join(project.dir, 'AGENTS.md'))).toBe(false);
    expect(await exists(join(project.dir, '.devin'))).toBe(false);
  });

  it('installs user-level hooks as a config.json merge, not a standalone file', async () => {
    project = await createE2eProject();
    const xdg: string = join(project.dir, 'xdg');

    const result: CommandResult = await project.run(
      ['setup', '--level=user', '--scope=hooks'],
      { env: { XDG_CONFIG_HOME: xdg } },
    );

    expect(result.exitCode).toBe(0);
    expect(await exists(join(xdg, 'devin', 'hooks', 'omd-mode.mjs'))).toBe(
      true,
    );
    expect(await exists(join(xdg, 'devin', 'hooks.v1.json'))).toBe(false);
    const config: Record<string, unknown> = JSON.parse(
      await readFile(join(xdg, 'devin', 'config.json'), 'utf8'),
    ) as Record<string, unknown>;
    expect(config['hooks']).toBeDefined();
  });

  it('ignores a relative XDG_CONFIG_HOME and writes outside the project', async () => {
    project = await createE2eProject();
    const home: string = join(project.dir, 'home');

    const result: CommandResult = await project.run(
      ['setup', '--level=user', '--scope=roles'],
      { env: { XDG_CONFIG_HOME: 'relative-cfg', HOME: home } },
    );

    expect(result.exitCode).toBe(0);
    expect(await exists(join(project.dir, 'relative-cfg'))).toBe(false);
    expect(await exists(join(project.dir, '.devin'))).toBe(false);
    expect(
      await exists(
        join(home, '.config', 'devin', 'agents', 'reviewer', 'AGENT.md'),
      ),
    ).toBe(true);
  });

  it('refuses user-level teams, which have no verified user-level location', async () => {
    project = await createE2eProject();
    const xdg: string = join(project.dir, 'xdg');

    const result: CommandResult = await project.run(
      ['setup', '--level=user', '--scope=teams'],
      { env: { XDG_CONFIG_HOME: xdg } },
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Refused:');
    expect(result.stdout).toContain('teams —');
    expect(await exists(join(xdg, 'devin', 'teams'))).toBe(false);
  });
});
