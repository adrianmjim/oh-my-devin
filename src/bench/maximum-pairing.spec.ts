import { describe, expect, it } from 'vitest';
import { maximumPairing } from './maximum-pairing';
import type { PairingOption } from './pairing-option';

function option(
  itemId: string,
  itemIndex: number,
  candidateId: string,
  candidateIndex: number,
  score: number,
): PairingOption {
  return {
    item: { id: itemId, keywords: [] },
    candidate: { id: candidateId, text: '' },
    itemIndex,
    candidateIndex,
    score,
  };
}

describe('maximumPairing', () => {
  it('pairs more items instead of keeping the strongest single pair', () => {
    const options: readonly PairingOption[] = [
      option('item-0', 0, 'finding-a', 0, 1),
      option('item-1', 1, 'finding-a', 0, 1),
      option('item-0', 0, 'finding-b', 1, 0.75),
    ];

    const selection: readonly PairingOption[] = maximumPairing(options);

    expect(
      selection.map((chosen: PairingOption): readonly string[] => [
        chosen.item.id,
        chosen.candidate.id,
      ]),
    ).toEqual([
      ['item-0', 'finding-b'],
      ['item-1', 'finding-a'],
    ]);
  });

  it('prefers the strongest total among equal pair counts', () => {
    const options: readonly PairingOption[] = [
      option('item-0', 0, 'finding-a', 0, 1),
      option('item-0', 0, 'finding-b', 1, 0.6),
      option('item-1', 1, 'finding-a', 0, 0.6),
      option('item-1', 1, 'finding-b', 1, 1),
    ];

    const selection: readonly PairingOption[] = maximumPairing(options);

    expect(
      selection.map((chosen: PairingOption): readonly string[] => [
        chosen.item.id,
        chosen.candidate.id,
      ]),
    ).toEqual([
      ['item-0', 'finding-a'],
      ['item-1', 'finding-b'],
    ]);
  });

  it('selects nothing from an empty option list', () => {
    expect(maximumPairing([])).toEqual([]);
  });

  it('is deterministic: the same options twice yield the same selection', () => {
    const options: readonly PairingOption[] = [
      option('item-0', 0, 'finding-a', 0, 0.8),
      option('item-0', 0, 'finding-b', 1, 0.8),
    ];

    expect(maximumPairing(options)).toEqual(maximumPairing(options));
  });
});
