import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createProcessStageRunner } from './create-process-stage-runner';

describe('createProcessStageRunner', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-stage-runner-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('builds a stage runner bound to the base directory', () => {
    expect(typeof createProcessStageRunner(baseDir, null, 'run-1')).toBe(
      'function',
    );
  });

  it('builds a separate runner per call', () => {
    expect(createProcessStageRunner(baseDir, null, 'run-1')).not.toBe(
      createProcessStageRunner(baseDir, null, 'run-1'),
    );
  });
});
