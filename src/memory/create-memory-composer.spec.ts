import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appendNotepadEntry } from './append-notepad-entry';
import { createMemoryComposer } from './create-memory-composer';
import { EMPTY_MEMORY_DELIVERY } from './empty-memory-delivery';
import type { KnowledgeEntry } from './knowledge-entry';
import type { MemoryComposer } from './memory-composer';
import type { MemoryDelivery } from './memory-delivery';
import { readProfile } from './read-profile';
import { writeKnowledge } from './write-knowledge';

const ASSIGNMENT: string = 'ship the release';

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

    expect(await compose([], ASSIGNMENT)).toEqual(EMPTY_MEMORY_DELIVERY);
  });

  it('composes exactly the notepad for a notepad selection', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const delivery: MemoryDelivery = await compose(['notepad'], ASSIGNMENT);

    expect(delivery.profile).toBeNull();
    expect(delivery.notepad).toHaveLength(1);
    expect(delivery.notepad[0]?.text).toBe('the gate is manual');
  });

  it('composes exactly the profile for a profile selection', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const delivery: MemoryDelivery = await compose(['profile'], ASSIGNMENT);

    expect(delivery.notepad).toEqual([]);
    expect(delivery.profile?.layout).toEqual(['src']);
  });

  it('derives the profile only when a selection asks for it', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    await compose(['notepad'], ASSIGNMENT);

    expect(await readProfile(projectDir)).toBeNull();
  });

  it('composes both classes when both are declared', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const delivery: MemoryDelivery = await compose(['profile', 'notepad'], ASSIGNMENT);

    expect(delivery.profile).not.toBeNull();
    expect(delivery.notepad).toHaveLength(1);
  });

  it('serves every composition from one snapshot of the notepad', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);
    const first: MemoryDelivery = await compose(['notepad'], ASSIGNMENT);

    await appendNotepadEntry(projectDir, 'manual', 'a later note', 50);
    const second: MemoryDelivery = await compose(['notepad'], ASSIGNMENT);

    expect(second.notepad).toEqual(first.notepad);
    expect(second.notepad).toHaveLength(1);
  });

  it('serves every composition from one snapshot of the profile', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);
    const first: MemoryDelivery = await compose(['profile'], ASSIGNMENT);

    await mkdir(join(projectDir, 'docs'), { recursive: true });
    const second: MemoryDelivery = await compose(['profile'], ASSIGNMENT);

    expect(second.profile).toEqual(first.profile);
    expect(second.profile?.layout).toEqual(['src']);
  });

  it('composes the knowledge the assignment triggers', async () => {
    await writeKnowledge(projectDir, [
      {
        text: 'the release gate is manual',
        triggers: ['release'],
        hash: 'abc',
        recordedAt: 5,
      },
      {
        text: 'migrations run forward only',
        triggers: ['migration'],
        hash: 'def',
        recordedAt: 6,
      },
    ]);
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const delivery: MemoryDelivery = await compose(['knowledge'], ASSIGNMENT);

    expect(
      delivery.knowledge.map((entry: KnowledgeEntry): string => entry.text),
    ).toEqual(['the release gate is manual']);
  });

  it('composes no knowledge the assignment triggers nothing of', async () => {
    await writeKnowledge(projectDir, [
      {
        text: 'migrations run forward only',
        triggers: ['migration'],
        hash: 'def',
        recordedAt: 6,
      },
    ]);
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    expect((await compose(['knowledge'], ASSIGNMENT)).knowledge).toEqual([]);
  });

  it('composes no knowledge for a role that declares none', async () => {
    await writeKnowledge(projectDir, [
      {
        text: 'the release gate is manual',
        triggers: ['release'],
        hash: 'abc',
        recordedAt: 5,
      },
    ]);
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    expect((await compose(['notepad'], ASSIGNMENT)).knowledge).toEqual([]);
  });

  it('composes identical content for every caller of the same selection', async () => {
    const compose: MemoryComposer = createMemoryComposer(projectDir, 100);

    const first: MemoryDelivery = await compose(['profile', 'notepad'], ASSIGNMENT);
    const second: MemoryDelivery = await compose(['profile', 'notepad'], ASSIGNMENT);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
