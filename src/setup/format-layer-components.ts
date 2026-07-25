import { ALL_LAYER_COMPONENTS } from './layer-component';

export function formatLayerComponents(separator: string): string {
  return ALL_LAYER_COMPONENTS.join(separator);
}
