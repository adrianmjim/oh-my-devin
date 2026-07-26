import { describe, expect, it } from 'vitest';
import { parseClusters } from './parse-clusters';

describe('parseClusters', () => {
  it('parses a partition of the claim indices', () => {
    expect(parseClusters('[[0,1],[2]]', 3)).toEqual([[0, 1], [2]]);
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseClusters('  [[0]]  ', 1)).toEqual([[0]]);
  });

  it('is null for invalid JSON', () => {
    expect(parseClusters('not json', 1)).toBeNull();
  });

  it('is null when the payload is not an array of arrays', () => {
    expect(parseClusters('{}', 1)).toBeNull();
    expect(parseClusters('[0]', 1)).toBeNull();
  });

  it('is null for an empty cluster', () => {
    expect(parseClusters('[[0],[]]', 1)).toBeNull();
  });

  it('is null for an index outside the claim range', () => {
    expect(parseClusters('[[0],[1]]', 1)).toBeNull();
    expect(parseClusters('[[-1]]', 1)).toBeNull();
  });

  it('is null for a repeated index', () => {
    expect(parseClusters('[[0],[0]]', 1)).toBeNull();
  });

  it('is null when the partition does not cover every claim', () => {
    expect(parseClusters('[[0]]', 2)).toBeNull();
  });
});
