import type { SetupRefusal } from './setup-refusal';
import type { TargetReport } from './target-report';

export interface SetupResult {
  readonly targets: readonly TargetReport[];
  readonly refusals: readonly SetupRefusal[];
}
