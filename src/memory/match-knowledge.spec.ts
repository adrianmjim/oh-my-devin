import { describe, expect, it } from 'vitest';
import { AMBIENT_KNOWLEDGE_ENTRY_CAP } from './ambient-knowledge-entry-cap';
import { contentHash } from './content-hash';
import type { KnowledgeEntry } from './knowledge-entry';
import { matchKnowledge } from './match-knowledge';

function entry(
  text: string,
  triggers: readonly string[],
  recordedAt: number = 1,
): KnowledgeEntry {
  return { text, triggers, hash: contentHash(text), recordedAt };
}

const DEPLOY: KnowledgeEntry = entry('the deploy gate is manual', [
  'deploy',
  'release',
]);
const MIGRATION: KnowledgeEntry = entry('migrations run forward only', [
  'migration',
]);

describe('matchKnowledge', () => {
  it('matches an entry whose trigger the text carries', () => {
    expect(
      matchKnowledge([DEPLOY, MIGRATION], 'can you deploy the api tonight'),
    ).toEqual([DEPLOY]);
  });

  it('matches regardless of the case the text uses', () => {
    expect(matchKnowledge([DEPLOY], 'Deploy it now')).toEqual([DEPLOY]);
  });

  it('excludes every entry the text triggers nothing of', () => {
    expect(
      matchKnowledge([DEPLOY, MIGRATION], 'what does the readme say'),
    ).toEqual([]);
  });

  it('matches a trigger only as a whole word', () => {
    expect(matchKnowledge([DEPLOY], 'redeployment pipeline notes')).toEqual([]);
  });

  it('matches an entry carrying any one of its triggers', () => {
    expect(matchKnowledge([DEPLOY], 'cut the release branch')).toEqual([
      DEPLOY,
    ]);
  });

  it('bounds the ambient selection', () => {
    const many: readonly KnowledgeEntry[] = Array.from(
      { length: AMBIENT_KNOWLEDGE_ENTRY_CAP + 2 },
      (_unused: unknown, index: number): KnowledgeEntry =>
        entry(`fact ${index}`, ['deploy'], index),
    );

    expect(matchKnowledge(many, 'deploy now')).toHaveLength(
      AMBIENT_KNOWLEDGE_ENTRY_CAP,
    );
  });

  it('matches nothing against empty text', () => {
    expect(matchKnowledge([DEPLOY], '')).toEqual([]);
  });

  it('never matches an entry carrying no triggers', () => {
    expect(matchKnowledge([entry('a fact', [])], 'a fact')).toEqual([]);
  });
});
