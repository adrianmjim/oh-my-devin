import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendNotepadEntry } from './append-notepad-entry';
import { createMemoryComposer } from './create-memory-composer';
import { EMPTY_MEMORY_DELIVERY } from './empty-memory-delivery';
import type { MemoryComposer } from './memory-composer';
import type { MemoryDelivery } from './memory-delivery';
import { readProfile } from './read-profile';

describe('createMemoryComposer', () => {
  let projectDir: string;

  beforeEach(async () => {
    projectDir = await mkdtemp(join(tmpdir(), 'omd-memory-composer-'));
    await mkdir(join(projectDir, 'src'), { recursive: true });
    await appendNotepadEntry(projectDir, 'manual', 'the gate is manual', 5);
  });

  afterEach(async () => {
    await rm(projectDir, { recursive: true, force: true });
  });

  it('composes nothing for an empty selection', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    expect(await compose([])).toEqual(EMPTY_MEMORY_DELIVERY);
  });

  it('composes exactly the notepad for a notepad selection', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const delivery: MemoryDelivery = await compose(['notepad']);

    expect(delivery.profile).toBeNull();
    expect(delivery.notepad).toHaveLength(1);
    expect(delivery.notepad[0]?.text).toBe('the gate is manual');
  });

  it('composes exactly the profile for a profile selection', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const delivery: MemoryDelivery = await compose(['profile']);

    expect(delivery.notepad).toEqual([]);
    expect(delivery.profile?.layout).toEqual(['src']);
  });

  it('derives the profile only when a selection asks for it', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    await compose(['notepad']);

    expect(await readProfile(projectDir)).toBeNull();
  });

  it('composes both classes when both are declared', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const delivery: MemoryDelivery = await compose(['profile', 'notepad']);

    expect(delivery.profile).not.toBeNull();
    expect(delivery.notepad).toHaveLength(1);
  });

  it('serves every composition from one snapshot of the notepad', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);
    const first: MemoryDelivery = await compose(['notepad']);

    await appendNotepadEntry(projectDir, 'manual', 'a later note', 50);
    const second: MemoryDelivery = await compose(['notepad']);

    expect(second.notepad).toEqual(first.notepad);
    expect(second.notepad).toHaveLength(1);
  });

  it('serves every composition from one snapshot of the profile', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);
    const first: MemoryDelivery = await compose(['profile']);

    await mkdir(join(projectDir, 'docs'), { recursive: true });
    const second: MemoryDelivery = await compose(['profile']);

    expect(second.profile).toEqual(first.profile);
    expect(second.profile?.layout).toEqual(['src']);
  });

  it('composes identical content for every caller of the same selection', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const first: MemoryDelivery = await compose(['profile', 'notepad']);
    const second: MemoryDelivery = await compose(['profile', 'notepad']);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
