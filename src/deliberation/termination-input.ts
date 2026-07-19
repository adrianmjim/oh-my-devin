import type { Severity } from '../council/severity';
import type { TypedPosition } from './typed-position';

export interface TerminationInput {
  readonly consented: boolean;
  readonly blocking: readonly TypedPosition[];
  readonly previousBlocking: readonly TypedPosition[];
  readonly threshold: Severity;
  readonly round: number;
  readonly roundsCap: number;
  readonly wallTimeExceeded: boolean;
}
