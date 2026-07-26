import { describe, expect, it } from 'vitest';
import { EMPTY_STUB_SCRIPT } from './empty-stub-script';

describe('EMPTY_STUB_SCRIPT', () => {
  it('scripts no turns and no listing', () => {
    expect(EMPTY_STUB_SCRIPT).toEqual({ turns: [], listResponse: null });
  });
});
