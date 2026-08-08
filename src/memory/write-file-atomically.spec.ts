import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { writeFileAtomically } from './write-file-atomically';

describe('writeFileAtomically', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-atomic-write-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('writes the content at the target path', async () => {
    const target: string = join(baseDir, 'store.json');

    await writeFileAtomically(target, 'held content\n');

    expect(await readFile(target, 'utf8')).toBe('held content\n');
  });

  it('creates the missing parent directories', async () => {
    const target: string = join(baseDir, 'nested', 'deep', 'store.json');

    await writeFileAtomically(target, 'nested content\n');

    expect(await readFile(target, 'utf8')).toBe('nested content\n');
  });

  it('replaces existing content wholesale', async () => {
    const target: string = join(baseDir, 'store.json');
    await writeFileAtomically(target, 'first\n');

    await writeFileAtomically(target, 'second\n');

    expect(await readFile(target, 'utf8')).toBe('second\n');
  });

  it('leaves nothing beside the target file', async () => {
    const target: string = join(baseDir, 'store.json');

    await writeFileAtomically(target, 'held content\n');

    expect(await readdir(baseDir)).toEqual(['store.json']);
  });
});
