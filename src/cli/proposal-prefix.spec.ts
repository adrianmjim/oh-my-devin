import { describe, expect, it } from 'vitest';
import { PROPOSAL_PREFIX } from './proposal-prefix';

describe('PROPOSAL_PREFIX', () => {
  it('introduces the inline council proposal flag', () => {
    expect(PROPOSAL_PREFIX).toBe('--proposal=');
  });

  it('ends with the assignment character the inline form needs', () => {
    expect(PROPOSAL_PREFIX.endsWith('=')).toBe(true);
  });
});
