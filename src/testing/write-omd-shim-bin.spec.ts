import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CLI_PATH } from './cli-path';
import { writeOmdShimBin } from './write-omd-shim-bin';

describe('writeOmdShimBin', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'omd-shim-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('writes an executable named omd', async () => {
    const binPath: string = await writeOmdShimBin(join(root, 'bin'));

    expect(binPath).toBe(join(root, 'bin', 'omd'));
    expect(((await stat(binPath)).mode & 0o111) !== 0).toBe(true);
  });

  it('forwards to the built cli', async () => {
    const binPath: string = await writeOmdShimBin(join(root, 'bin'));

    expect(await readFile(binPath, 'utf8')).toContain(CLI_PATH);
  });

  it('forwards through the running node executable', async () => {
    const binPath: string = await writeOmdShimBin(join(root, 'bin'));

    expect(await readFile(binPath, 'utf8')).toContain(process.execPath);
  });
});
