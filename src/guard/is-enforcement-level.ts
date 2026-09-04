import { ALL_ENFORCEMENT_LEVELS } from './all-enforcement-levels';
import type { EnforcementLevel } from './enforcement-level';

export function isEnforcementLevel(value: unknown): value is EnforcementLevel {
  return ALL_ENFORCEMENT_LEVELS.some(
    (level: EnforcementLevel): boolean => level === value,
  );
}
