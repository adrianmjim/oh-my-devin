import type { LayerComponent } from './layer-component';
import type { MergeStrategy } from './merge-strategy';

export interface LayerFile {
  readonly relativePath: string;
  readonly content: string;
  readonly component: LayerComponent;
  readonly strategy: MergeStrategy;
  readonly regionId: string;
  readonly userContent?: string;
}
