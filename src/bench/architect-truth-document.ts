import type { ArchitectTruthItem } from './architect-truth-item';

export interface ArchitectTruthDocument {
  readonly role: 'architect';
  readonly gaps: readonly ArchitectTruthItem[];
  readonly spurious: readonly ArchitectTruthItem[];
}
