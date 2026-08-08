import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendNotepadEntry } from './append-notepad-entry';
import { composeMemoryDelivery } from './compose-memory-delivery';
import { EMPTY_MEMORY_DELIVERY } from './empty-memory-delivery';
import type { MemoryDelivery } from './memory-delivery';
import { readProfile } from './read-profile';

describe('composeMemoryDelivery', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-compose-memory-'));
    await mkdir(join(projectDir, 'src'), { recursive: true });
    await appendNotepadEntry(projectDir, 'manual', 'the gate is manual', 5);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('composes nothing for an empty selection', async () => {
    expect(await composeMemoryDelivery(projectDir, [], 100)).toEqual(
      EMPTY_MEMORY_DELIVERY,
    );
  });

  it('composes exactly the notepad for a notepad selection', async () => {
    const delivery: MemoryDelivery = await composeMemoryDelivery(
      projectDir,
      ['notepad'],
      100,
    );

    expect(delivery.profile).toBeNull();
    expect(delivery.notepad).toHaveLength(1);
    expect(delivery.notepad[0]?.text).toBe('the gate is manual');
  });

  it('composes exactly the profile for a profile selection', async () => {
    const delivery: MemoryDelivery = await composeMemoryDelivery(
      projectDir,
      ['profile'],
      100,
    );

    expect(delivery.notepad).toEqual([]);
    expect(delivery.profile?.layout).toEqual(['src']);
  });

  it('derives the profile only when the selection asks for it', async () => {
    await composeMemoryDelivery(projectDir, ['notepad'], 100);

    expect(await readProfile(projectDir)).toBeNull();
  });

  it('composes both classes when both are declared', async () => {
    const delivery: MemoryDelivery = await composeMemoryDelivery(
      projectDir,
      ['profile', 'notepad'],
      100,
    );

    expect(delivery.profile).not.toBeNull();
    expect(delivery.notepad).toHaveLength(1);
  });

  it('composes the same content for the same store, whoever asks', async () => {
    const first: MemoryDelivery = await composeMemoryDelivery(
      projectDir,
      ['profile', 'notepad'],
      100,
    );
    const second: MemoryDelivery = await composeMemoryDelivery(
      projectDir,
      ['profile', 'notepad'],
      100,
    );

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
