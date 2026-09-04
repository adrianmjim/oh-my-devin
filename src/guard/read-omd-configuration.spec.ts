import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { OmdConfiguration } from './omd-configuration';
import { readOmdConfiguration } from './read-omd-configuration';

describe('readOmdConfiguration', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-read-config-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reads the declared level from an existing file', async () => {
    const path: string = join(dir, 'config.yaml');
    await writeFile(path, 'guard:\n  level: ask\n', 'utf8');

    const config: OmdConfiguration | null = await readOmdConfiguration(path);

    expect(config).toEqual({ guard: { level: 'ask' } });
  });

  it('resolves a missing file as absent', async () => {
    expect(await readOmdConfiguration(join(dir, 'absent.yaml'))).toBeNull();
  });

  it('resolves an unreadable file as absent', async () => {
    const path: string = join(dir, 'locked.yaml');
    await writeFile(path, 'guard:\n  level: strict\n', 'utf8');
    await chmod(path, 0o000);

    expect(await readOmdConfiguration(path)).toBeNull();

    await chmod(path, 0o600);
  });
});
