import type { AnalystTruthItem } from './analyst-truth-item';

export interface AnalystTruthDocument {
  readonly role: 'analyst';
  readonly gaps: readonly AnalystTruthItem[];
}
