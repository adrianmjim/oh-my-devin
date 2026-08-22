import { describe, expect, it } from 'vitest';
import { AMBIENT_KNOWLEDGE_ENTRY_CAP } from './ambient-knowledge-entry-cap';

describe('AMBIENT_KNOWLEDGE_ENTRY_CAP', () => {
  it('bounds how many matched knowledge entries one injection carries', () => {
    expect(typeof AMBIENT_KNOWLEDGE_ENTRY_CAP).toBe('number');
    expect(AMBIENT_KNOWLEDGE_ENTRY_CAP).toBeGreaterThan(0);
    expect(Number.isInteger(AMBIENT_KNOWLEDGE_ENTRY_CAP)).toBe(true);
  });
});
