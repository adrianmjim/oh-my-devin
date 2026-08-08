import type { CriticCategory } from './critic-category';
import type { ReviewerSeverity } from './reviewer-severity';

export interface CriticFinding {
  readonly severity: ReviewerSeverity;
  readonly category: CriticCategory;
  readonly where: string;
  readonly summary: string;
  readonly fix: string;
}
