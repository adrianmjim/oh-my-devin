import { describe, expect, it } from 'vitest';
import { isSummaryProse } from './is-summary-prose';

describe('isSummaryProse', () => {
  it('accepts a line of prose', () => {
    expect(isSummaryProse('You are the architect.', '')).toBe(true);
  });

  it('rejects an empty line', () => {
    expect(isSummaryProse('', 'You are the architect.')).toBe(false);
  });

  it('rejects an atx heading', () => {
    expect(isSummaryProse('## Mission', '')).toBe(false);
  });

  it('rejects a setext heading by its underline', () => {
    expect(isSummaryProse('Architect', '=========')).toBe(false);
  });

  it('rejects the setext underline itself', () => {
    expect(isSummaryProse('=========', 'You are the architect.')).toBe(false);
  });
});
