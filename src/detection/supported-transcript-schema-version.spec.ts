import { describe, expect, it } from 'vitest';
import { SUPPORTED_TRANSCRIPT_SCHEMA_VERSION } from './supported-transcript-schema-version';

describe('SUPPORTED_TRANSCRIPT_SCHEMA_VERSION', () => {
  it('pins the one engine schema revision the reader was written against', () => {
    expect(typeof SUPPORTED_TRANSCRIPT_SCHEMA_VERSION).toBe('number');
    expect(Number.isInteger(SUPPORTED_TRANSCRIPT_SCHEMA_VERSION)).toBe(true);
    expect(SUPPORTED_TRANSCRIPT_SCHEMA_VERSION).toBeGreaterThan(0);
  });
});
