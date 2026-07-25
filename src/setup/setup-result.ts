import type { LayerComponent } from './layer-component';

export interface SetupRefusal {
  readonly component: LayerComponent;
  readonly reason: string;
}

export interface SetupResult {
  readonly writtenPaths: readonly string[];
  readonly refusals: readonly SetupRefusal[];
}
