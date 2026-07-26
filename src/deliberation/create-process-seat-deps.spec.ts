import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { runRole } from '../run/run-role';
import { createProcessSeatDeps } from './create-process-seat-deps';
import type { SeatSessionDeps } from './seat-session-deps';

describe('createProcessSeatDeps', () => {
  let baseDir: string;

  beforeEach(async () => {
    baseDir = await mkdtemp(join(tmpdir(), 'omd-seat-deps-'));
  });

  afterEach(async () => {
    await rm(baseDir, { recursive: true, force: true });
  });

  it('wires the real role runner', () => {
    const deps: SeatSessionDeps = createProcessSeatDeps(baseDir, null);

    expect(deps.runRole).toBe(runRole);
  });

  it('carries the user config directory it is given', () => {
    expect(createProcessSeatDeps(baseDir, '/config').userConfigDir).toBe(
      '/config',
    );
  });

  it('reads an artifact from disk', async () => {
    const path: string = join(baseDir, 'artifact.json');
    await writeFile(path, '{"ok":true}', 'utf8');

    expect(await createProcessSeatDeps(baseDir, null).readArtifact(path)).toBe(
      '{"ok":true}',
    );
  });

  it('gives each working directory its own command runner', () => {
    const deps: SeatSessionDeps = createProcessSeatDeps(baseDir, null);

    expect(deps.runnerFor('/a')).not.toBe(deps.runnerFor('/b'));
  });

  it('reads the wall clock in milliseconds', () => {
    const before: number = Date.now();

    expect(createProcessSeatDeps(baseDir, null).clock()).toBeGreaterThanOrEqual(
      before,
    );
  });
});
