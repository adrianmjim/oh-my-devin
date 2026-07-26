import { describe, expect, it } from 'vitest';
import { formatLayerComponents } from './format-layer-components';
import { ALL_LAYER_COMPONENTS } from '../layer/layer-component';

describe('formatLayerComponents', () => {
  it('renders every component in declaration order', () => {
    expect(formatLayerComponents(',')).toBe(ALL_LAYER_COMPONENTS.join(','));
  });

  it('renders every component with a spaced separator', () => {
    expect(formatLayerComponents(', ')).toBe(ALL_LAYER_COMPONENTS.join(', '));
  });

  it('names each component of the vocabulary', () => {
    const rendered: string = formatLayerComponents(',');

    for (const component of ALL_LAYER_COMPONENTS) {
      expect(rendered).toContain(component);
    }
  });
});
