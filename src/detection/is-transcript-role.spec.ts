import { describe, expect, it } from 'vitest';
import { isTranscriptRole } from './is-transcript-role';

describe('isTranscriptRole', () => {
  it('recognizes every role the engine records', () => {
    expect(isTranscriptRole('system')).toBe(true);
    expect(isTranscriptRole('user')).toBe(true);
    expect(isTranscriptRole('assistant')).toBe(true);
    expect(isTranscriptRole('tool')).toBe(true);
  });

  it('rejects a value outside the vocabulary', () => {
    expect(isTranscriptRole('narrator')).toBe(false);
    expect(isTranscriptRole(undefined)).toBe(false);
    expect(isTranscriptRole(['user'])).toBe(false);
  });
});
