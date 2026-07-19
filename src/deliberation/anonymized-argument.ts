import type { Severity } from '../council/severity';
import type { PositionKind } from './position-kind';

export interface AnonymizedArgument {
  readonly kind: PositionKind;
  readonly domain: string;
  readonly severity: Severity;
  readonly concern: string;
}
