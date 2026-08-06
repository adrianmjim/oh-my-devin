import { describe, expect, it } from 'vitest';
import type { KeywordItem } from './keyword-item';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { matchKeywordItems } from './match-keyword-items';
import type { PairingCandidate } from './pairing-candidate';

const ITEMS: readonly KeywordItem[] = [
  { id: 'no-migration', keywords: ['migration', 'column'] },
  { id: 'no-backfill', keywords: ['backfill'] },
];

describe('matchKeywordItems', () => {
  it('matches every item a candidate carries', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'step-0', text: 'Add the migration renaming the column' },
      { id: 'step-1', text: 'Backfill the new column' },
    ];

    expect(matchKeywordItems(candidates, ITEMS, KEYWORD_MATCH_THRESHOLD)).toEqual(
      ['no-migration', 'no-backfill'],
    );
  });

  it('lets one candidate match several items at once', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'approach', text: 'Backfill after the migration renames the column' },
    ];

    expect(matchKeywordItems(candidates, ITEMS, KEYWORD_MATCH_THRESHOLD)).toEqual(
      ['no-migration', 'no-backfill'],
    );
  });

  it('leaves an item below the threshold unmatched', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'step-0', text: 'Touch the column only' },
    ];

    expect(
      matchKeywordItems(candidates, ITEMS, KEYWORD_MATCH_THRESHOLD),
    ).toEqual([]);
  });

  it('reports matches in item order regardless of candidate order', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'step-0', text: 'Backfill it' },
      { id: 'step-1', text: 'Add the migration for the column' },
    ];

    expect(
      matchKeywordItems(candidates, ITEMS, KEYWORD_MATCH_THRESHOLD),
    ).toEqual(['no-migration', 'no-backfill']);
  });

  it('matches nothing when there are no candidates', () => {
    expect(matchKeywordItems([], ITEMS, KEYWORD_MATCH_THRESHOLD)).toEqual([]);
  });
});
