import { describe, expect, it } from 'vitest';
import { domainWithinLens } from './domain-within-lens';

describe('domainWithinLens', () => {
  it('accepts a domain whose tokens the lens all carries', () => {
    expect(domainWithinLens('auth', 'auth and security')).toBe(true);
  });

  it('refuses a domain carrying a token outside the lens', () => {
    expect(domainWithinLens('auth latency', 'auth')).toBe(false);
  });

  it('refuses an empty domain', () => {
    expect(domainWithinLens('', 'auth')).toBe(false);
  });

  it('compares tokens case-insensitively', () => {
    expect(domainWithinLens('AUTH', 'auth')).toBe(true);
  });
});
