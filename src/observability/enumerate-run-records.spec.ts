import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { enumerateRunRecords } from './enumerate-run-records';
import type { RunId } from './run-id';
import { RunRecordPaths } from './run-record-paths';

const WINDOW_MS: number = 60000;

describe('enumerateRunRecords', () => {
  let baseDir: string;
  let now: number;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-enumerate-'));
    now = Date.now();
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  async function seedRecord(runId: RunId, mtime: number): Promise<void> {
    const paths: RunRecordPaths = new RunRecordPaths(baseDir, runId);
    await mkdir(paths.dir, { recursive: true });
    await utimes(paths.dir, new Date(mtime), new Date(mtime));
  }

  it('discovers the run directories under .omd/runs', async () => {
    await seedRecord('run-a', now);
    await seedRecord('run-b', now);

    const found: readonly RunId[] = await enumerateRunRecords(
      baseDir,
      now,
      WINDOW_MS,
    );

    expect([...found].sort()).toEqual(['run-a', 'run-b']);
  });

  it('excludes records colder than the window', async () => {
    await seedRecord('run-warm', now);
    await seedRecord('run-cold', now - WINDOW_MS * 2);

    const found: readonly RunId[] = await enumerateRunRecords(
      baseDir,
      now,
      WINDOW_MS,
    );

    expect(found).toEqual(['run-warm']);
  });

  it('prefilters on directory mtime alone, without reading any journal', async () => {
    await seedRecord('run-no-journal', now);
    await seedRecord('run-cold', now - WINDOW_MS * 2);
    const cold: RunRecordPaths = new RunRecordPaths(baseDir, 'run-cold');
    await writeFile(cold.journal, 'not json at all', 'utf8');
    await utimes(
      cold.dir,
      new Date(now - WINDOW_MS * 2),
      new Date(now - WINDOW_MS * 2),
    );

    const found: readonly RunId[] = await enumerateRunRecords(
      baseDir,
      now,
      WINDOW_MS,
    );

    expect(found).toEqual(['run-no-journal']);
  });

  it('ignores entries under .omd/runs that are not directories', async () => {
    await seedRecord('run-a', now);
    await writeFile(join(baseDir, '.omd', 'runs', 'stray.txt'), 'x', 'utf8');

    const found: readonly RunId[] = await enumerateRunRecords(
      baseDir,
      now,
      WINDOW_MS,
    );

    expect(found).toEqual(['run-a']);
  });

  it('ignores directories whose name is not a valid run identity', async () => {
    await seedRecord('run-a', now);
    const stray: string = join(baseDir, '.omd', 'runs', 'not a run id');
    await mkdir(stray, { recursive: true });

    const found: readonly RunId[] = await enumerateRunRecords(
      baseDir,
      now,
      WINDOW_MS,
    );

    expect(found).toEqual(['run-a']);
  });

  it('yields nothing when the runs directory is empty', async () => {
    await mkdir(join(baseDir, '.omd', 'runs'), { recursive: true });

    expect(await enumerateRunRecords(baseDir, now, WINDOW_MS)).toEqual([]);
  });

  it('yields nothing when the project has no runs directory', async () => {
    expect(await enumerateRunRecords(baseDir, now, WINDOW_MS)).toEqual([]);
  });
});
