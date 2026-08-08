import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BenchFixture } from './bench-fixture';
import { BenchFixtureError } from './bench-fixture-error';
import { loadFixture } from './load-fixture';

describe('loadFixture', () => {
  let roleDir: string;

  beforeEach(async () => {
    roleDir = await mkdtemp(join(tmpdir(), 'omd-bench-load-'));
    const dir: string = join(roleDir, 'no-migration');
    await mkdir(join(dir, 'tree'), { recursive: true });
    await writeFile(join(dir, 'tree', 'schema.sql'), 'create table t;\n', 'utf8');
    await writeFile(
      join(dir, 'truth.json'),
      JSON.stringify({
        role: 'architect',
        gaps: [{ id: 'no-migration', keywords: ['migration'] }],
      }),
      'utf8',
    );
    await writeFile(join(dir, 'task.md'), '  Plan the rename.  \n', 'utf8');
    await writeFile(
      join(dir, 'sample.json'),
      JSON.stringify({ approach: 'a', steps: [{ description: 'b' }] }),
      'utf8',
    );
  });

  afterEach(async () => {
    await rm(roleDir, { recursive: true, force: true });
  });

  it('loads a fixture with its tree, truth, task and sample artifact', async () => {
    const fixture: BenchFixture = await loadFixture('architect', roleDir, {
      id: 'no-migration',
      clean: false,
    });

    expect(fixture.id).toBe('no-migration');
    expect(fixture.role).toBe('architect');
    expect(fixture.dir).toBe(join(roleDir, 'no-migration'));
    expect(fixture.treeDir).toBe(join(roleDir, 'no-migration', 'tree'));
    expect(fixture.task).toBe('Plan the rename.');
    expect(fixture.truth.role).toBe('architect');
    expect(fixture.sampleArtifact).toContain('approach');
  });

  it('rejects a fixture whose tree is a file rather than a directory', async () => {
    const dir: string = join(roleDir, 'broken-tree');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'tree'), 'not a directory', 'utf8');

    await expect(
      loadFixture('architect', roleDir, { id: 'broken-tree', clean: false }),
    ).rejects.toThrow(BenchFixtureError);
  });

  it('rejects a fixture the manifest names but does not exist', async () => {
    await expect(
      loadFixture('architect', roleDir, { id: 'absent', clean: false }),
    ).rejects.toThrow(BenchFixtureError);
  });
});
