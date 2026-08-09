import { ALL_BENCH_ROLES } from './all-bench-roles';
import type { BenchRole } from './bench-role';

export function isBenchRole(value: unknown): value is BenchRole {
  return (
    typeof value === 'string' &&
    (ALL_BENCH_ROLES as readonly string[]).includes(value)
  );
}
