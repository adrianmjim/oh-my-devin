import type { AnalystTruthDocument } from './analyst-truth-document';
import type { ArchitectTruthDocument } from './architect-truth-document';
import type { CriticTruthDocument } from './critic-truth-document';
import type { ExecutorTruthDocument } from './executor-truth-document';
import type { DebuggerTruthDocument } from './debugger-truth-document';
import type { DocumentSpecialistTruthDocument } from './document-specialist-truth-document';
import type { ExploreTruthDocument } from './explore-truth-document';
import type { ReviewerTruthDocument } from './reviewer-truth-document';
import type { SecurityReviewerTruthDocument } from './security-reviewer-truth-document';

export type TruthDocument =
  | ReviewerTruthDocument
  | ArchitectTruthDocument
  | ExecutorTruthDocument
  | CriticTruthDocument
  | AnalystTruthDocument
  | SecurityReviewerTruthDocument
  | DebuggerTruthDocument
  | ExploreTruthDocument
  | DocumentSpecialistTruthDocument;
