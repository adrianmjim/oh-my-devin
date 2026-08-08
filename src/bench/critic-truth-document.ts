import type { CriticTruthItem } from './critic-truth-item';
import type { ReviewerVerdict } from './reviewer-verdict';

export interface CriticTruthDocument {
  readonly role: 'critic';
  readonly expectedVerdict: ReviewerVerdict;
  readonly findings: readonly CriticTruthItem[];
}
