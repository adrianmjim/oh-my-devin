import { describe, expect, it } from 'vitest';
import { hookEntryHooks } from './hook-entry-hooks';

describe('hookEntryHooks', () => {
  it('yields the hooks a matcher entry holds', () => {
    expect(hookEntryHooks({ hooks: [{ type: 'command' }] })).toEqual([
      { type: 'command' },
    ]);
  });

  it('is empty when the entry holds no hooks list', () => {
    expect(hookEntryHooks({ hooks: 'nope' })).toEqual([]);
    expect(hookEntryHooks({})).toEqual([]);
  });

  it('is empty for a value that is not a readable object', () => {
    expect(hookEntryHooks(null)).toEqual([]);
    expect(hookEntryHooks(3)).toEqual([]);
  });
});
