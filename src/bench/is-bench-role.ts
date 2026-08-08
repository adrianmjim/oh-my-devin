import type { BenchRole } from './bench-role';

export function isBenchRole(value: unknown): value is BenchRole {
  return (
    value === 'reviewer' || value === 'architect' || value === 'executor'
  );
}
