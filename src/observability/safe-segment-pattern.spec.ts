import { describe, expect, it } from 'vitest';
import { SAFE_SEGMENT_PATTERN } from './safe-segment-pattern';

describe('SAFE_SEGMENT_PATTERN', () => {
  it('accepts a segment of letters, digits, dots, dashes, and underscores', () => {
    expect(SAFE_SEGMENT_PATTERN.test('run-2026.07_26')).toBe(true);
  });

  it('rejects a path separator', () => {
    expect(SAFE_SEGMENT_PATTERN.test('a/b')).toBe(false);
    expect(SAFE_SEGMENT_PATTERN.test('a\\b')).toBe(false);
  });

  it('rejects an empty segment', () => {
    expect(SAFE_SEGMENT_PATTERN.test('')).toBe(false);
  });

  it('anchors so no unsafe character can hide at either end', () => {
    expect(SAFE_SEGMENT_PATTERN.test(' run')).toBe(false);
    expect(SAFE_SEGMENT_PATTERN.test('run ')).toBe(false);
  });
});
