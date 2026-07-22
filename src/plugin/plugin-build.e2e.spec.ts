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

describe('omd plugin build (e2e)', () => {
  let project: E2eProject | null = null;

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('writes the manifest, rules, and skills bundle files', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run([
      'plugin',
      'build',
      '--out',
      'bundle',
    ]);

    expect(result.exitCode).toBe(0);
    const bundle: string = join(project.dir, 'bundle');
    expect(await exists(join(bundle, '.devin-plugin', 'plugin.json'))).toBe(
      true,
    );
    expect(await exists(join(bundle, 'AGENTS.md'))).toBe(true);
    expect(
      await exists(join(bundle, 'skills', 'omd-delegate', 'SKILL.md')),
    ).toBe(true);
    expect(await exists(join(bundle, 'skills', 'team', 'SKILL.md'))).toBe(true);
  });
});
