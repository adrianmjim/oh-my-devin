import { closeSync, openSync } from 'node:fs';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RunRecordPaths } from '../observability/run-record-paths';
import { openRunLogs } from './open-run-logs';
import type { RunLogDescriptors } from './run-log-descriptors';

describe('openRunLogs', () => {
  let base: string;

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'omd-run-logs-'));
  });

  afterEach(async () => {
    await rm(base, { recursive: true, force: true });
  });

  it('opens distinct appendable descriptors for both run logs', async () => {
    const paths = new RunRecordPaths(base, 'run-1');
    await mkdir(paths.dir, { recursive: true });

    const logs: RunLogDescriptors = openRunLogs(paths);
    closeSync(logs.stdoutFd);
    closeSync(logs.stderrFd);

    expect(logs.stdoutFd).not.toBe(logs.stderrFd);
  });

  it('closes the stdout descriptor when the stderr log cannot be opened', async () => {
    const paths = new RunRecordPaths(base, 'run-1');
    await mkdir(paths.stderr, { recursive: true });

    const probeBefore: number = openSync(join(base, 'probe'), 'w');
    closeSync(probeBefore);

    expect((): RunLogDescriptors => openRunLogs(paths)).toThrow();

    const probeAfter: number = openSync(join(base, 'probe'), 'w');
    closeSync(probeAfter);
    expect(probeAfter).toBe(probeBefore);
  });
});
