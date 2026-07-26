import type { LayerComponent } from '../layer/layer-component';

export interface RefusedTarget {
  readonly kind: 'refused';
  readonly component: LayerComponent;
  readonly reason: string;
}
