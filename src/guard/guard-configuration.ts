import type { EnforcementLevel } from './enforcement-level';

export interface GuardConfiguration {
  readonly level: EnforcementLevel | null;
}
