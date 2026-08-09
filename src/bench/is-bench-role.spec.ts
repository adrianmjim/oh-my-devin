import { describe, expect, it } from 'vitest';
import { isBenchRole } from './is-bench-role';

describe('isBenchRole', () => {
  it('accepts every installed catalog role the bench covers', () => {
    for (const role of [
      'reviewer',
      'architect',
      'executor',
      'critic',
      'analyst',
      'security-reviewer',
      'debugger',
      'explore',
      'document-specialist',
    ]) {
      expect(isBenchRole(role), role).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isBenchRole('tester')).toBe(false);
    expect(isBenchRole(null)).toBe(false);
  });
});
