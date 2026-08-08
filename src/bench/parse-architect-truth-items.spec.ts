import { describe, expect, it } from 'vitest';
import type { ArchitectTruthItem } from './architect-truth-item';
import { BenchFixtureError } from './bench-fixture-error';
import { parseArchitectTruthItems } from './parse-architect-truth-items';

describe('parseArchitectTruthItems', () => {
  it('parses each entry into an id and its keywords', () => {
    const items: readonly ArchitectTruthItem[] = parseArchitectTruthItems(
      [{ id: 'no-rollback', keywords: ['rollback'] }],
      'truth.json#gaps',
    );

    expect(items).toEqual([{ id: 'no-rollback', keywords: ['rollback'] }]);
  });

  it('returns nothing for an empty list', () => {
    expect(parseArchitectTruthItems([], 'truth.json#spurious')).toEqual([]);
  });

  it('rejects an entry with no keywords, naming its index', () => {
    expect(() =>
      parseArchitectTruthItems([{ id: 'a', keywords: [] }], 'truth.json#gaps'),
    ).toThrow(BenchFixtureError);
    expect(() =>
      parseArchitectTruthItems([{ id: 'a', keywords: [] }], 'truth.json#gaps'),
    ).toThrow('truth.json#gaps[0].keywords');
  });
});
