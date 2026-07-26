import type { Dirent } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

const MY_RULES: string = [
  '# House rules',
  '',
  'Never force-push. Never delete my notes.',
  '',
].join('\n');

const MY_TEAM: string = [
  'name: default',
  'members:',
  '  - role: reviewer',
  '    count: 2',
  '',
].join('\n');

const MY_SKILL: string = [
  '---',
  'name: plan',
  '---',
  '',
  'My own planning skill.',
  '',
].join('\n');

const FOREIGN_HOOKS: string = `${JSON.stringify(
  {
    PreToolUse: [
      { hooks: [{ type: 'command', command: 'node ./scripts/my-guard.mjs' }] },
    ],
  },
  null,
  2,
)}\n`;

async function writeAt(
  dir: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const absolutePath: string = join(dir, relativePath);
  await mkdir(join(absolutePath, '..'), { recursive: true });
  await writeFile(absolutePath, content, 'utf8');
}

async function snapshot(dir: string): Promise<Map<string, string>> {
  const files: Map<string, string> = new Map<string, string>();
  const entries: readonly string[] = (
    await readdir(dir, { recursive: true, withFileTypes: true })
  )
    .filter((entry: Dirent): boolean => entry.isFile())
    .map((entry: Dirent): string =>
      relative(dir, join(entry.parentPath, entry.name)),
    );
  for (const entry of entries) {
    files.set(entry, await readFile(join(dir, entry), 'utf8'));
  }
  return files;
}

describe('omd setup never destroys (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('keeps a hand-authored rules file, a foreign hook, a team and a skill it did not write', async () => {
    project = await createE2eProject();
    await writeAt(project.dir, 'AGENTS.md', MY_RULES);
    await writeAt(project.dir, join('.devin', 'hooks.v1.json'), FOREIGN_HOOKS);
    await writeAt(
      project.dir,
      join('.devin', 'teams', 'default.yaml'),
      MY_TEAM,
    );
    await writeAt(
      project.dir,
      join('.devin', 'skills', 'plan', 'SKILL.md'),
      MY_SKILL,
    );

    const result: CommandResult = await project.run(['setup']);

    expect(result.exitCode).toBe(0);

    const rules: string = await readFile(
      join(project.dir, 'AGENTS.md'),
      'utf8',
    );
    expect(rules.startsWith(MY_RULES)).toBe(true);
    expect(rules).toContain('omd:begin id=rules');

    const hooks: Record<string, unknown> = JSON.parse(
      await readFile(join(project.dir, '.devin', 'hooks.v1.json'), 'utf8'),
    ) as Record<string, unknown>;
    expect(hooks['PreToolUse']).toEqual([
      { hooks: [{ type: 'command', command: 'node ./scripts/my-guard.mjs' }] },
    ]);
    expect(hooks['SessionStart']).toBeDefined();

    expect(
      await readFile(
        join(project.dir, '.devin', 'teams', 'default.yaml'),
        'utf8',
      ),
    ).toBe(MY_TEAM);
    expect(
      await readFile(
        join(project.dir, '.devin', 'skills', 'plan', 'SKILL.md'),
        'utf8',
      ),
    ).toBe(MY_SKILL);

    expect(result.stdout).toContain('Conflicted:');
    expect(result.stdout).toContain(join('.devin', 'teams', 'default.yaml'));
    expect(result.stdout).toContain(
      join('.devin', 'skills', 'plan', 'SKILL.md'),
    );
  });

  it('does not register hooks pointing at a script it refused to install', async () => {
    project = await createE2eProject();
    const myScript: string = 'export {};\n';
    await writeAt(
      project.dir,
      join('.devin', 'hooks', 'omd-mode.mjs'),
      myScript,
    );

    const result: CommandResult = await project.run(['setup']);

    expect(result.exitCode).toBe(0);
    expect(
      await readFile(
        join(project.dir, '.devin', 'hooks', 'omd-mode.mjs'),
        'utf8',
      ),
    ).toBe(myScript);
    const files: Map<string, string> = await snapshot(project.dir);
    expect(files.has(join('.devin', 'hooks.v1.json'))).toBe(false);
    expect(result.stdout).toContain('Blocked:');
    expect(result.stdout).toContain(join('.devin', 'hooks.v1.json'));
  });

  it('leaves every project-level target byte-identical on a second run', async () => {
    project = await createE2eProject();
    await project.run(['setup']);
    const first: Map<string, string> = await snapshot(project.dir);

    const result: CommandResult = await project.run(['setup']);

    expect(result.exitCode).toBe(0);
    expect(await snapshot(project.dir)).toEqual(first);
    expect(result.stdout).toContain('Unchanged:');
  });

  it('leaves every user-level target byte-identical on a second run', async () => {
    project = await createE2eProject();
    const xdg: string = join(project.dir, 'xdg');
    const argv: readonly string[] = [
      'setup',
      '--level=user',
      '--scope=rules,roles,skills,hooks',
    ];
    await project.run(argv, { env: { XDG_CONFIG_HOME: xdg } });
    const first: Map<string, string> = await snapshot(join(xdg, 'devin'));

    const result: CommandResult = await project.run(argv, {
      env: { XDG_CONFIG_HOME: xdg },
    });

    expect(result.exitCode).toBe(0);
    expect(await snapshot(join(xdg, 'devin'))).toEqual(first);
  });

  it('lets an unparseable engine configuration block only itself', async () => {
    project = await createE2eProject();
    const xdg: string = join(project.dir, 'xdg');
    await writeAt(xdg, join('devin', 'config.json'), 'not valid json {{');

    const result: CommandResult = await project.run(
      ['setup', '--level=user', '--scope=roles,skills,hooks'],
      { env: { XDG_CONFIG_HOME: xdg } },
    );

    expect(result.exitCode).toBe(0);
    expect(await readFile(join(xdg, 'devin', 'config.json'), 'utf8')).toBe(
      'not valid json {{',
    );
    expect(result.stdout).toContain('Blocked:');
    expect(result.stdout).toContain('config.json');

    const installed: Map<string, string> = await snapshot(join(xdg, 'devin'));
    expect(installed.has(join('agents', 'reviewer', 'AGENT.md'))).toBe(true);
    expect(installed.has(join('skills', 'omd-delegate', 'SKILL.md'))).toBe(
      true,
    );
    expect(installed.has(join('hooks', 'omd-mode.mjs'))).toBe(true);
  });
});
