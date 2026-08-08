import type { ArchitectTruthDocument } from './architect-truth-document';
import type { ExecutorTruthDocument } from './executor-truth-document';
import type { ReviewerTruthDocument } from './reviewer-truth-document';

export type TruthDocument =
  | ReviewerTruthDocument
  | ArchitectTruthDocument
  | ExecutorTruthDocument;
