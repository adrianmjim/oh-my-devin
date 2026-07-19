import type { CheckOutcome } from './check-outcome';

export interface CheckResult {
  readonly name: string;
  readonly outcome: CheckOutcome;
  readonly message: string;
}
