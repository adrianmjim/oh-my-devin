import type { AnalystSurface } from './analyst-surface';

export interface AnalystTruthItem {
  readonly id: string;
  readonly keywords: readonly string[];
  readonly surface: AnalystSurface;
}
