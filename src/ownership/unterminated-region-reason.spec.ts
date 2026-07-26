import { describe, expect, it } from 'vitest';
import { UNTERMINATED_REGION_REASON } from './unterminated-region-reason';

describe('UNTERMINATED_REGION_REASON', () => {
  it('states that the region was never closed', () => {
    expect(UNTERMINATED_REGION_REASON).toBe('its omd region has no end marker');
  });
});
