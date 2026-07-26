import { describe, expect, it } from 'vitest';
import { INCOMING_ARTIFACTS } from './incoming-artifacts';

describe('INCOMING_ARTIFACTS', () => {
  it('designates the inputs of every stage', () => {
    expect(INCOMING_ARTIFACTS).toEqual({
      architect: ['requirements'],
      executor: ['requirements', 'architecture.json'],
      reviewer: ['requirements', 'diff', 'evidence.json'],
    });
  });

  it('gives every stage the requirements', () => {
    for (const inputs of Object.values(INCOMING_ARTIFACTS)) {
      expect(inputs).toContain('requirements');
    }
  });
});
