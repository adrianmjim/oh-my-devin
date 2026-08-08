import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BenchFixtureError } from './bench-fixture-error';
import { readBenchFile } from './read-bench-file';

describe('readBenchFile', () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'omd-bench-read-'));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reads a fixture file as text', async () => {
    await writeFile(join(dir, 'task.md'), 'Review the diff.\n', 'utf8');

    await expect(readBenchFile(join(dir, 'task.md'))).resolves.toBe(
      'Review the diff.\n',
    );
  });

  it('names the missing path rather than leaking an errno', async () => {
    await expect(readBenchFile(join(dir, 'truth.json'))).rejects.toThrow(
      BenchFixtureError,
    );
    await expect(readBenchFile(join(dir, 'truth.json'))).rejects.toThrow(
      /truth\.json/,
    );
  });
});
