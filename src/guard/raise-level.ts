import { ALL_ENFORCEMENT_LEVELS } from './all-enforcement-levels';
import type { EnforcementLevel } from './enforcement-level';
import { MODE_LEVEL_RAISES } from './mode-level-raises';

export function raiseLevel(
  configured: EnforcementLevel,
  modes: readonly string[],
): EnforcementLevel {
  let raised: EnforcementLevel = configured;
  for (const mode of modes) {
    const candidate: EnforcementLevel | undefined = MODE_LEVEL_RAISES.get(mode);
    if (
      candidate !== undefined &&
      ALL_ENFORCEMENT_LEVELS.indexOf(candidate) >
        ALL_ENFORCEMENT_LEVELS.indexOf(raised)
    ) {
      raised = candidate;
    }
  }
  return raised;
}
