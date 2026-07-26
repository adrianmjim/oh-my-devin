import { describe, expect, it } from 'vitest';
import { UNMARKED_JSON_REASON } from './unmarked-json-reason';

describe('UNMARKED_JSON_REASON', () => {
  it('states that a foreign document occupies the path', () => {
    expect(UNMARKED_JSON_REASON).toBe(
      'a document omd did not write already occupies that path',
    );
  });
});
