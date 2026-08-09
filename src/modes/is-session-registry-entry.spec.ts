import { describe, expect, it } from 'vitest';
import { isSessionRegistryEntry } from './is-session-registry-entry';

describe('isSessionRegistryEntry', () => {
  it('recognizes a registry entry', () => {
    expect(isSessionRegistryEntry({ sessionId: 'sess-1', lastSeenAt: 1 })).toBe(
      true,
    );
  });

  it('rejects a value carrying no session identity', () => {
    expect(isSessionRegistryEntry({ lastSeenAt: 1 })).toBe(false);
  });

  it('rejects a value whose last-seen time is not a number', () => {
    expect(
      isSessionRegistryEntry({ sessionId: 'sess-1', lastSeenAt: 'soon' }),
    ).toBe(false);
  });

  it('rejects values that are not objects', () => {
    expect(isSessionRegistryEntry(null)).toBe(false);
    expect(isSessionRegistryEntry('sess-1')).toBe(false);
    expect(isSessionRegistryEntry([])).toBe(false);
  });
});
