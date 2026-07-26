import { describe, expect, it } from 'vitest';
import { isRunKind } from './is-run-kind';

describe('isRunKind', () => {
  it('accepts the two run kinds', () => {
    expect(isRunKind('single-role')).toBe(true);
    expect(isRunKind('pipeline')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isRunKind('council')).toBe(false);
    expect(isRunKind(null)).toBe(false);
  });
});
