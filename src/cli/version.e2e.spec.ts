import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { CommandResult } from '../engine/command-result';
import { createE2eProject } from '../testing/create-e2e-project';
import type { E2eProject } from '../testing/e2e-project';

describe('omd --version (e2e)', () => {
  let project: E2eProject | null = null;
  let manifestVersion: string = '';

  beforeAll(async () => {
    const raw: string = await readFile(resolve('package.json'), 'utf8');
    const manifest: Record<string, unknown> = JSON.parse(raw) as Record<
      string,
      unknown
    >;
    const version: unknown = manifest['version'];
    if (typeof version !== 'string') {
      throw new Error('package manifest is missing a string "version"');
    }
    manifestVersion = version;
  });

  afterEach(async () => {
    if (project !== null) {
      await project.cleanup();
      project = null;
    }
  });

  it('prints the manifest version and exits zero', async () => {
    project = await createE2eProject();

    const result: CommandResult = await project.run(['--version']);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe(manifestVersion);
  });
});
