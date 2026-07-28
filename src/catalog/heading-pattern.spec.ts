import { describe, expect, it } from 'vitest';
import { HEADING_PATTERN } from './heading-pattern';

describe('HEADING_PATTERN', () => {
  it('matches a heading of every markdown depth', () => {
    expect(HEADING_PATTERN.test('# Role')).toBe(true);
    expect(HEADING_PATTERN.test('###### Detail')).toBe(true);
  });

  it('matches an empty heading', () => {
    expect(HEADING_PATTERN.test('#')).toBe(true);
    expect(HEADING_PATTERN.test('##')).toBe(true);
  });

  it('does not match a hash that is not heading markup', () => {
    expect(HEADING_PATTERN.test('#not-a-heading is the tag.')).toBe(false);
    expect(HEADING_PATTERN.test('####### too deep')).toBe(false);
  });

  it('does not match ordinary prose', () => {
    expect(HEADING_PATTERN.test('You are the architect.')).toBe(false);
  });
});
