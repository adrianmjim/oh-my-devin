import type { OutcomeTransition } from './outcome-transition';

export interface TeamTransition {
  readonly from: string;
  readonly then: string | null;
  readonly outcomes: readonly OutcomeTransition[];
}
