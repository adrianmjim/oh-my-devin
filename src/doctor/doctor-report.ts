import type { CheckResult } from './check-result';

export interface DoctorReport {
  readonly checks: readonly CheckResult[];
  readonly exitCode: number;
}
