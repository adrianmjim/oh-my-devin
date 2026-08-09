import type { ExploreTruthFile } from './explore-truth-file';
import type { KeywordItem } from './keyword-item';

export interface ExploreTruthDocument {
  readonly role: 'explore';
  readonly files: readonly ExploreTruthFile[];
  readonly relationships: readonly KeywordItem[];
}
