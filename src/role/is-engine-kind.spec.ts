import { describe, expect, it } from 'vitest';
import { isEngineKind } from './is-engine-kind';

describe('isEngineKind', () => {
  it('accepts the devin engine', () => {
    expect(isEngineKind('devin')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isEngineKind('claude')).toBe(false);
    expect(isEngineKind(undefined)).toBe(false);
  });
});
