import { describe, expect, it } from 'vitest';
import { DEFAULT_AUTHORITY_POLICY } from './default-authority-policy';

describe('DEFAULT_AUTHORITY_POLICY', () => {
  it('requires a human decision when a council declares no authority', () => {
    expect(DEFAULT_AUTHORITY_POLICY).toBe('human');
  });
});
