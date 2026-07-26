import type { LayerComponent } from '../layer/layer-component';
import type { RefusedTarget } from './refused-target';

export function resolveRefusedTarget(component: LayerComponent): RefusedTarget {
  return {
    kind: 'refused',
    component,
    reason: 'no verified user-level discovery location',
  };
}
