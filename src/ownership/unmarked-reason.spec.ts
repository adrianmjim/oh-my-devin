import { describe, expect, it } from 'vitest';
import { UNMARKED_REASON } from './unmarked-reason';

describe('UNMARKED_REASON', () => {
  it('states that a foreign file occupies the path', () => {
    expect(UNMARKED_REASON).toBe(
      'a file omd did not write already occupies that path',
    );
  });
});
