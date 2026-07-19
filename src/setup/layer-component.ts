export type LayerComponent = 'rules' | 'roles' | 'skills' | 'hooks';

export const ALL_LAYER_COMPONENTS: readonly LayerComponent[] = [
  'rules',
  'roles',
  'skills',
  'hooks',
];

export function isLayerComponent(value: unknown): value is LayerComponent {
  return (
    value === 'rules' ||
    value === 'roles' ||
    value === 'skills' ||
    value === 'hooks'
  );
}
