import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS } from './all-layer-components';
import { isLayerComponent } from './is-layer-component';

describe('ALL_LAYER_COMPONENTS', () => {
  it('enumerates every installable component', () => {
    expect(ALL_LAYER_COMPONENTS).toEqual([
      'rules',
      'roles',
      'skills',
      'hooks',
      'teams',
    ]);
  });

  it('holds only recognized components', () => {
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(isLayerComponent(component)).toBe(true);
    }
  });
});
