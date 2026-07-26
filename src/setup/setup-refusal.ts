import type { LayerComponent } from '../layer/layer-component';

export interface SetupRefusal {
  readonly component: LayerComponent;
  readonly reason: string;
}
