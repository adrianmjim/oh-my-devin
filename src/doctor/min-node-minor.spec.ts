import { describe, expect, it } from 'vitest';
import { MIN_NODE_MINOR } from './min-node-minor';

describe('MIN_NODE_MINOR', () => {
  it('requires the minor line carrying the fixes omd relies on', () => {
    expect(MIN_NODE_MINOR).toBe(14);
  });
});
