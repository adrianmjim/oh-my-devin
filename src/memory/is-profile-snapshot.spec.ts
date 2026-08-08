import { describe, expect, it } from 'vitest';
import { isProfileSnapshot } from './is-profile-snapshot';

describe('isProfileSnapshot', () => {
  it('recognizes a well-formed snapshot', () => {
    expect(
      isProfileSnapshot({
        stack: ['node'],
        layout: ['src'],
        entryCommands: ['pnpm run test'],
        derivedAt: 5,
      }),
    ).toBe(true);
  });

  it('rejects a value that is not a snapshot object', () => {
    expect(isProfileSnapshot(null)).toBe(false);
    expect(isProfileSnapshot('node')).toBe(false);
    expect(isProfileSnapshot([])).toBe(false);
  });

  it('rejects a snapshot with a missing or mistyped field', () => {
    expect(
      isProfileSnapshot({ stack: ['node'], layout: ['src'], derivedAt: 5 }),
    ).toBe(false);
    expect(
      isProfileSnapshot({
        stack: ['node'],
        layout: ['src'],
        entryCommands: [7],
        derivedAt: 5,
      }),
    ).toBe(false);
  });
});
