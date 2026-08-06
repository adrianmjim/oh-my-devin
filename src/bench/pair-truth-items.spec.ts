import { describe, expect, it } from 'vitest';
import type { KeywordItem } from './keyword-item';
import { KEYWORD_MATCH_THRESHOLD } from './keyword-match-threshold';
import { pairTruthItems } from './pair-truth-items';
import type { PairingCandidate } from './pairing-candidate';
import type { PairingResult } from './pairing-result';

const ITEMS: readonly KeywordItem[] = [
  { id: 'unbounded-loop', keywords: ['unbounded', 'loop', 'terminate'] },
  { id: 'missing-guard', keywords: ['null', 'guard'] },
];

describe('pairTruthItems', () => {
  it('pairs a candidate carrying enough of an item keyword set', () => {
    const candidates: readonly PairingCandidate[] = [
      {
        id: 'finding-0',
        text: 'The unbounded loop never terminates on empty input',
      },
    ];

    const result: PairingResult = pairTruthItems(
      candidates,
      ITEMS,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(result.pairs).toEqual([
      { candidateId: 'finding-0', itemId: 'unbounded-loop', score: 1 },
    ]);
    expect(result.unmatchedItemIds).toEqual(['missing-guard']);
    expect(result.unmatchedCandidateIds).toEqual([]);
  });

  it('leaves a near-miss below the threshold unpaired', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'finding-0', text: 'The loop reads oddly' },
    ];

    const result: PairingResult = pairTruthItems(
      candidates,
      ITEMS,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(result.pairs).toEqual([]);
    expect(result.unmatchedCandidateIds).toEqual(['finding-0']);
    expect(result.unmatchedItemIds).toEqual([
      'unbounded-loop',
      'missing-guard',
    ]);
  });

  it('gives each item and each candidate at most one partner', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'finding-0', text: 'unbounded loop, never terminates' },
      { id: 'finding-1', text: 'the loop is unbounded and does not terminate' },
    ];

    const result: PairingResult = pairTruthItems(
      candidates,
      ITEMS,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0]?.itemId).toBe('unbounded-loop');
    expect(result.unmatchedCandidateIds).toHaveLength(1);
  });

  it('prefers the strongest pairing when several clear the threshold', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'weak', text: 'unbounded loop somewhere' },
      { id: 'strong', text: 'unbounded loop fails to terminate' },
    ];

    const result: PairingResult = pairTruthItems(
      candidates,
      ITEMS,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(result.pairs[0]?.candidateId).toBe('strong');
  });

  it('is deterministic: the same inputs twice yield the same pairs', () => {
    const candidates: readonly PairingCandidate[] = [
      { id: 'finding-0', text: 'a null guard is missing' },
      { id: 'finding-1', text: 'unbounded loop never terminates' },
    ];

    const first: PairingResult = pairTruthItems(
      candidates,
      ITEMS,
      KEYWORD_MATCH_THRESHOLD,
    );
    const second: PairingResult = pairTruthItems(
      candidates,
      ITEMS,
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(first).toEqual(second);
    expect(first.pairs).toHaveLength(2);
  });

  it('reports every candidate as unmatched when there are no items', () => {
    const result: PairingResult = pairTruthItems(
      [{ id: 'finding-0', text: 'anything at all' }],
      [],
      KEYWORD_MATCH_THRESHOLD,
    );

    expect(result.pairs).toEqual([]);
    expect(result.unmatchedCandidateIds).toEqual(['finding-0']);
    expect(result.unmatchedItemIds).toEqual([]);
  });
});
