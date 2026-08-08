import { describe, expect, it } from 'vitest';
import { AMBIENT_PROPOSAL_CAP } from './ambient-proposal-cap';

describe('AMBIENT_PROPOSAL_CAP', () => {
  it('bounds how many proposals one injection carries', () => {
    expect(typeof AMBIENT_PROPOSAL_CAP).toBe('number');
    expect(AMBIENT_PROPOSAL_CAP).toBeGreaterThan(0);
    expect(Number.isInteger(AMBIENT_PROPOSAL_CAP)).toBe(true);
  });
});
