import type { LayerComponent } from './layer-component';

export interface LayerFile {
  readonly relativePath: string;
  readonly content: string;
  readonly component: LayerComponent;
}
