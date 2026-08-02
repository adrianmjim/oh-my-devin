import { mkdir, mkdtemp, rm, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { recordActivityAt } from './record-activity-at';
import { RunRecordPaths } from './run-record-paths';

const CREATED_AT: number = 10000000;
const APPENDED_AT: number = 20000000;
const STAMPED_AT: number = 30000000;

describe('recordActivityAt', () => {
  let baseDir: string;
  let paths: RunRecordPaths;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-record-activity-'));
    paths = new RunRecordPaths(baseDir, 'run-1');
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('reads the directory time for a record holding no files yet', async () => {
    await mkdir(paths.dir, { recursive: true });
    await utimes(paths.dir, new Date(CREATED_AT), new Date(CREATED_AT));

    expect(await recordActivityAt(paths)).toBe(CREATED_AT);
  });

  it('reads the liveness stamp write as the freshest activity', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.journal, '{}\n', 'utf8');
    await writeFile(paths.liveness, '{}\n', 'utf8');
    await utimes(paths.dir, new Date(CREATED_AT), new Date(CREATED_AT));
    await utimes(paths.journal, new Date(APPENDED_AT), new Date(APPENDED_AT));
    await utimes(paths.liveness, new Date(STAMPED_AT), new Date(STAMPED_AT));

    expect(await recordActivityAt(paths)).toBe(STAMPED_AT);
  });

  it('reads a journal append as the freshest activity', async () => {
    await mkdir(paths.dir, { recursive: true });
    await writeFile(paths.journal, '{}\n', 'utf8');
    await utimes(paths.dir, new Date(CREATED_AT), new Date(CREATED_AT));
    await utimes(paths.journal, new Date(APPENDED_AT), new Date(APPENDED_AT));

    expect(await recordActivityAt(paths)).toBe(APPENDED_AT);
  });

  it('is null for a record whose directory is missing', async () => {
    expect(await recordActivityAt(paths)).toBeNull();
  });
});
