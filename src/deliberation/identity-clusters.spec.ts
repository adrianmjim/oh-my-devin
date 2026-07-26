import { describe, expect, it } from 'vitest';
import { identityClusters } from './identity-clusters';

describe('identityClusters', () => {
  it('puts every claim in a cluster of its own', () => {
    expect(identityClusters(['a', 'b', 'c'])).toEqual([[0], [1], [2]]);
  });

  it('is empty for no claims', () => {
    expect(identityClusters([])).toEqual([]);
  });
});
