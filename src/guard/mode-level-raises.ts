import type { EnforcementLevel } from './enforcement-level';

export const MODE_LEVEL_RAISES: ReadonlyMap<string, EnforcementLevel> = new Map<
  string,
  EnforcementLevel
>([['autopilot', 'strict']]);
