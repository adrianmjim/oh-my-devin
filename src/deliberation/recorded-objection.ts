import type { Severity } from '../council/severity';

export interface RecordedObjection {
  readonly seat: string;
  readonly domain: string;
  readonly severity: Severity;
  readonly concern: string;
}
