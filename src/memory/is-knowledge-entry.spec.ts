import { describe, expect, it } from 'vitest';
import { isKnowledgeEntry } from './is-knowledge-entry';

describe('isKnowledgeEntry', () => {
  it('recognizes an entry carrying its triggers', () => {
    expect(
      isKnowledgeEntry({
        text: 'the deploy gate is manual',
        triggers: ['deploy', 'release'],
        hash: 'abc',
        recordedAt: 10,
      }),
    ).toBe(true);
  });

  it('rejects an entry carrying no triggers of its own', () => {
    expect(
      isKnowledgeEntry({ text: 'a fact', hash: 'abc', recordedAt: 10 }),
    ).toBe(false);
    expect(
      isKnowledgeEntry({
        text: 'a fact',
        triggers: [7],
        hash: 'abc',
        recordedAt: 10,
      }),
    ).toBe(false);
    expect(isKnowledgeEntry(null)).toBe(false);
  });
});
