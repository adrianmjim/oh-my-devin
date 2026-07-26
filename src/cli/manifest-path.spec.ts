import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MANIFEST_PATH } from './manifest-path';

describe('MANIFEST_PATH', () => {
  it('points at the package manifest', () => {
    expect(basename(MANIFEST_PATH)).toBe('package.json');
  });

  it('is absolute so it resolves from any working directory', () => {
    expect(MANIFEST_PATH.startsWith('/')).toBe(true);
  });

  it('addresses a readable manifest declaring this package', async () => {
    const manifest: Record<string, unknown> = JSON.parse(
      await readFile(MANIFEST_PATH, 'utf8'),
    ) as Record<string, unknown>;

    expect(manifest['name']).toBe('oh-my-devin');
  });
});
