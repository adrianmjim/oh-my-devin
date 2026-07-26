import type { LayerComponent } from './layer-component';

export function isLayerComponent(value: unknown): value is LayerComponent {
  return (
    value === 'rules' ||
    value === 'roles' ||
    value === 'skills' ||
    value === 'hooks' ||
    value === 'teams'
  );
}
