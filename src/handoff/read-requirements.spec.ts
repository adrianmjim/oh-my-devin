import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readRequirements } from './read-requirements';

describe('readRequirements', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-requirements-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('returns the contents of requirements.md when present', async () => {
    await writeFile(join(dir, 'requirements.md'), 'MUST be accessible\n');

    expect(await readRequirements(dir)).toBe('MUST be accessible\n');
  });

  it('returns null when requirements.md is absent', async () => {
    expect(await readRequirements(dir)).toBeNull();
  });

  it('returns null when the base directory does not exist', async () => {
    expect(await readRequirements(join(dir, 'missing'))).toBeNull();
  });

  it('returns null when requirements.md is not a readable file', async () => {
    await mkdir(join(dir, 'requirements.md'));

    expect(await readRequirements(dir)).toBeNull();
  });
});
