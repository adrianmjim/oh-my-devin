import { describe, expect, it } from 'vitest';
import { OUT_OF_ORDER_REASON } from './out-of-order-reason';

describe('OUT_OF_ORDER_REASON', () => {
  it('states that the end marker precedes the begin marker', () => {
    expect(OUT_OF_ORDER_REASON).toBe(
      'its omd region end marker precedes its begin marker',
    );
  });
});
