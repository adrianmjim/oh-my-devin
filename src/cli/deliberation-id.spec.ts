import { describe, expect, it } from 'vitest';
import { deliberationId } from './deliberation-id';

describe('deliberationId', () => {
  it('slugifies the question and appends a timestamp', () => {
    expect(deliberationId('Should we ship?')).toMatch(/^should-we-ship-\d+$/);
  });

  it('collapses runs of non-alphanumeric characters into single dashes', () => {
    expect(deliberationId('a  --  b')).toMatch(/^a-b-\d+$/);
  });

  it('falls back to a generic slug when nothing survives slugification', () => {
    expect(deliberationId('???')).toMatch(/^deliberation-\d+$/);
  });

  it('bounds the slug so the identifier stays a usable directory name', () => {
    const id: string = deliberationId('x'.repeat(120));

    expect(id.split('-')[0]).toHaveLength(40);
  });
});
