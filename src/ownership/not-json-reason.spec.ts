import { describe, expect, it } from 'vitest';
import { NOT_JSON_REASON } from './not-json-reason';

describe('NOT_JSON_REASON', () => {
  it('states that the document is not readable JSON', () => {
    expect(NOT_JSON_REASON).toBe('it is not a JSON object omd can read');
  });
});
