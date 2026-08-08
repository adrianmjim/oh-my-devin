import { describe, expect, it } from 'vitest';
import { ALL_BENCH_ROLES } from './all-bench-roles';
import { isBenchRole } from './is-bench-role';

describe('ALL_BENCH_ROLES', () => {
  it('enumerates every installed catalog role the bench covers', () => {
    expect(ALL_BENCH_ROLES).toEqual([
      'reviewer',
      'architect',
      'executor',
      'critic',
      'analyst',
      'security-reviewer',
      'debugger',
      'explore',
      'document-specialist',
    ]);
  });

  it('holds only values the role guard accepts', () => {
    expect(ALL_BENCH_ROLES.every(isBenchRole)).toBe(true);
  });
});
