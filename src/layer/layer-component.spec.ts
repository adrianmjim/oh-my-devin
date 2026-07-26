import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS, isLayerComponent } from './layer-component';

describe('layer component vocabulary', () => {
  it('includes teams as a selectable component', () => {
    expect(ALL_LAYER_COMPONENTS).toContain('teams');
    expect(isLayerComponent('teams')).toBe(true);
  });

  it('recognizes every canonical component', () => {
    for (const component of ['rules', 'roles', 'skills', 'hooks', 'teams']) {
      expect(isLayerComponent(component)).toBe(true);
    }
  });

  it('rejects an unknown component', () => {
    expect(isLayerComponent('bogus')).toBe(false);
  });
});
