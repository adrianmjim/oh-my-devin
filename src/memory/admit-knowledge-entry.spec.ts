import { describe, expect, it } from 'vitest';
import { admitKnowledgeEntry } from './admit-knowledge-entry';
import { contentHash } from './content-hash';
import type { KnowledgeEntry } from './knowledge-entry';
import { MEMORY_CLASS_CAP } from './memory-class-cap';

function entry(
  text: string,
  recordedAt: number,
  triggers: readonly string[] = ['deploy'],
): KnowledgeEntry {
  return { text, triggers, hash: contentHash(text), recordedAt };
}

describe('admitKnowledgeEntry', () => {
  it('admits an entry the class does not hold yet', () => {
    expect(
      admitKnowledgeEntry([], entry('the gate is manual', 10)),
    ).toHaveLength(1);
  });

  it('collapses identical text to a single entry', () => {
    const first: readonly KnowledgeEntry[] = admitKnowledgeEntry(
      [],
      entry('the gate is manual', 10),
    );

    const second: readonly KnowledgeEntry[] = admitKnowledgeEntry(
      first,
      entry('the gate is manual', 20, ['release']),
    );

    expect(second).toHaveLength(1);
    expect(second[0]?.recordedAt).toBe(10);
  });

  it('holds the class within its omd-owned cap', () => {
    const saturated: readonly KnowledgeEntry[] = Array.from(
      { length: MEMORY_CLASS_CAP.knowledge },
      (_unused: unknown, index: number): KnowledgeEntry =>
        entry(`fact ${index}`, index),
    );

    const admitted: readonly KnowledgeEntry[] = admitKnowledgeEntry(
      saturated,
      entry('one more', 9_000),
    );

    expect(admitted).toHaveLength(MEMORY_CLASS_CAP.knowledge);
    expect(admitted[admitted.length - 1]?.text).toBe('one more');
  });

  it('leaves the entries it was given untouched', () => {
    const held: readonly KnowledgeEntry[] = [entry('first', 1)];

    admitKnowledgeEntry(held, entry('second', 2));

    expect(held).toHaveLength(1);
  });
});
