import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { BenchFixture } from './bench-fixture';
import { BENCH_SCRATCH_DIR } from './bench-scratch-dir';
import { provisionScratchProject } from './provision-scratch-project';

describe('provisionScratchProject', () => {
  let fixtureDir: string;
  let fixture: BenchFixture;
  let scratchDirs: string[];

  beforeEach(async () => {
    scratchDirs = [];
    fixtureDir = await mkdtemp(join(tmpdir(), 'omd-bench-scratch-src-'));
    const treeDir: string = join(fixtureDir, 'tree');
    await mkdir(join(treeDir, 'src'), { recursive: true });
    await writeFile(join(treeDir, 'src', 'loop.js'), 'while (true) {}\n', 'utf8');
    await writeFile(join(treeDir, 'README.md'), '# fixture\n', 'utf8');
    fixture = {
      id: 'unbounded-loop',
      role: 'executor',
      clean: false,
      dir: fixtureDir,
      treeDir,
      task: 'Bound the loop.',
      truth: {
        role: 'executor',
        expectedTests: 'passed',
        criteria: [],
        verification: { command: 'node', args: ['--test'] },
        protectedPaths: [],
      },
      sampleArtifact: '{}',
    };
  });

  afterEach(async () => {
    await rm(fixtureDir, { recursive: true, force: true });
    for (const dir of scratchDirs) {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it('provisions the omd layer through the shipped setup surface', async () => {
    const scratch = await provisionScratchProject(fixture);
    scratchDirs.push(scratch.dir);

    const role: string = await readFile(
      join(scratch.dir, '.devin', 'agents', 'executor', 'AGENT.md'),
      'utf8',
    );

    expect(role).toContain('name: executor');
  });

  it('copies the fixture tree into the scratch project', async () => {
    const scratch = await provisionScratchProject(fixture);
    scratchDirs.push(scratch.dir);

    await expect(
      readFile(join(scratch.dir, 'src', 'loop.js'), 'utf8'),
    ).resolves.toBe('while (true) {}\n');
    await expect(
      readFile(join(scratch.dir, 'README.md'), 'utf8'),
    ).resolves.toBe('# fixture\n');
  });

  it('leaves the committed fixture tree untouched by writes to the copy', async () => {
    const scratch = await provisionScratchProject(fixture);
    scratchDirs.push(scratch.dir);

    await writeFile(join(scratch.dir, 'src', 'loop.js'), 'bounded\n', 'utf8');

    await expect(
      readFile(join(fixture.treeDir, 'src', 'loop.js'), 'utf8'),
    ).resolves.toBe('while (true) {}\n');
  });

  it('provisions inside the repository scratch root, not the system temp directory', async () => {
    const scratch = await provisionScratchProject(fixture);
    scratchDirs.push(scratch.dir);

    expect(scratch.dir.startsWith(`${BENCH_SCRATCH_DIR}/`)).toBe(true);
    expect(scratch.dir.startsWith(`${await realpath(tmpdir())}/`)).toBe(false);
  });

  it('gives each provisioning its own disposable directory', async () => {
    const first = await provisionScratchProject(fixture);
    const second = await provisionScratchProject(fixture);
    scratchDirs.push(first.dir, second.dir);

    expect(first.dir).not.toBe(second.dir);
  });

  it('removes the scratch copy on cleanup', async () => {
    const scratch = await provisionScratchProject(fixture);
    scratchDirs.push(scratch.dir);

    await scratch.cleanup();

    await expect(stat(scratch.dir)).rejects.toThrow();
  });
});
