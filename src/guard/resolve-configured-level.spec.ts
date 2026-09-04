import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { projectConfigPath } from './project-config-path';
import { resolveConfiguredLevel } from './resolve-configured-level';

describe('resolveConfiguredLevel', () => {
  let baseDir: string;
  let userFile: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-configured-level-'));
    userFile = join(baseDir, 'user', 'omd', 'config.yaml');
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  async function writeProject(level: string): Promise<void> {
    const path: string = projectConfigPath(baseDir);
    await mkdir(join(baseDir, '.omd'), { recursive: true });
    await writeFile(path, `guard:\n  level: ${level}\n`, 'utf8');
  }

  async function writeUser(level: string): Promise<void> {
    await mkdir(join(baseDir, 'user', 'omd'), { recursive: true });
    await writeFile(userFile, `guard:\n  level: ${level}\n`, 'utf8');
  }

  it('resolves warn when no configuration declares a level', async () => {
    expect(await resolveConfiguredLevel(baseDir, userFile)).toBe('warn');
  });

  it('resolves the user level when only the user configures one', async () => {
    await writeUser('ask');

    expect(await resolveConfiguredLevel(baseDir, userFile)).toBe('ask');
  });

  it('prefers the project level over the user level', async () => {
    await writeUser('off');
    await writeProject('strict');

    expect(await resolveConfiguredLevel(baseDir, userFile)).toBe('strict');
  });

  it('falls through a project file that declares no usable level', async () => {
    await writeUser('strict');
    await writeProject('paranoid');

    expect(await resolveConfiguredLevel(baseDir, userFile)).toBe('strict');
  });

  it('resolves the default when both files declare nothing usable', async () => {
    await mkdir(join(baseDir, '.omd'), { recursive: true });
    await writeFile(projectConfigPath(baseDir), 'telemetry: on\n', 'utf8');

    expect(await resolveConfiguredLevel(baseDir, userFile)).toBe('warn');
  });
});
