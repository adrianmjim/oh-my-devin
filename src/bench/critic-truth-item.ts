import type { CriticCategory } from './critic-category';
import type { ReviewerSeverity } from './reviewer-severity';

export interface CriticTruthItem {
  readonly id: string;
  readonly keywords: readonly string[];
  readonly severity: ReviewerSeverity;
  readonly category: CriticCategory;
}
