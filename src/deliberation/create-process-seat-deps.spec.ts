import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendNotepadEntry } from '../memory/append-notepad-entry';
import type { MemoryDelivery } from '../memory/memory-delivery';
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

  it('composes seat memory from the project store', async () => {
    await appendNotepadEntry(baseDir, 'manual', 'the gate is manual', 5);
    const deps: SeatSessionDeps = createProcessSeatDeps(baseDir, null);

    const delivery: MemoryDelivery = await deps.composeMemory(['notepad']);

    expect(delivery.notepad[0]?.text).toBe('the gate is manual');
  });

  it('serves every seat one snapshot of the store', async () => {
    await appendNotepadEntry(baseDir, 'manual', 'the first note', 5);
    const deps: SeatSessionDeps = createProcessSeatDeps(baseDir, null);
    const first: MemoryDelivery = await deps.composeMemory(['notepad']);

    await appendNotepadEntry(baseDir, 'manual', 'a mid-council note', 9);
    const second: MemoryDelivery = await deps.composeMemory(['notepad']);

    expect(second).toEqual(first);
    expect(second.notepad).toHaveLength(1);
  });
});
