import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MEMORY_SUBTREE_SEGMENTS } from './memory-subtree-segments';
import { MemoryStorePaths } from './memory-store-paths';

describe('MemoryStorePaths', () => {
  it('roots every class file in the durable subtree', () => {
    const paths: MemoryStorePaths = new MemoryStorePaths('/project');

    expect(paths.dir).toBe(join('/project', ...MEMORY_SUBTREE_SEGMENTS));
    expect(paths.notepad.startsWith(`${paths.dir}${join('/', '')}`)).toBe(true);
    expect(paths.profile.startsWith(`${paths.dir}${join('/', '')}`)).toBe(true);
  });

  it('keeps the classes in separate files', () => {
    const paths: MemoryStorePaths = new MemoryStorePaths('/project');

    expect(paths.notepad).not.toBe(paths.profile);
  });
});
