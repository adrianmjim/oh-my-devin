import type { Severity } from '../council/severity';
import type { PositionKind } from './position-kind';

export interface TypedPosition {
  readonly seat: string;
  readonly lens: string;
  readonly kind: PositionKind;
  readonly domain: string;
  readonly severity: Severity;
  readonly concern: string;
}
