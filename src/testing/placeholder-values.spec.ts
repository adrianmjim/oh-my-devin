import { describe, expect, it } from 'vitest';
import { PLACEHOLDER_VALUES } from './placeholder-values';

describe('PLACEHOLDER_VALUES', () => {
  it('substitutes a concrete value for every documented placeholder', () => {
    expect(PLACEHOLDER_VALUES).toEqual({
      '<role>': 'reviewer',
      '<run-id>': 'run-1',
      '<task>': 'ship it',
      '<team>': 'delivery',
    });
  });
});
