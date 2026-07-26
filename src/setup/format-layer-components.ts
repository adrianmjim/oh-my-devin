import { ALL_LAYER_COMPONENTS } from '../layer/all-layer-components';

export function formatLayerComponents(separator: string): string {
  return ALL_LAYER_COMPONENTS.join(separator);
}
