import type { Severity } from './severity';

export interface DeliberationTunables {
  readonly roundsCap: number;
  readonly blockingThreshold: Severity;
  readonly wallTimeMs: number | null;
}
