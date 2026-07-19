import type { GateResolution } from './gate-resolution';
import type { RecordedObjection } from './recorded-objection';

export interface AuthorityOutcome {
  readonly resolution: GateResolution;
  readonly dissent: readonly RecordedObjection[];
}
