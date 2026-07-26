import type { MergeStrategy } from './merge-strategy';

export interface SetupPlacement {
  readonly relativePath: string;
  readonly strategy: MergeStrategy;
}
