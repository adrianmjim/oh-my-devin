import { describe, expect, it } from 'vitest';
import { isLayerComponent } from './is-layer-component';

describe('isLayerComponent', () => {
  it('accepts every installable component', () => {
    for (const component of ['rules', 'roles', 'skills', 'hooks', 'teams']) {
      expect(isLayerComponent(component)).toBe(true);
    }
  });

  it('rejects anything else', () => {
    expect(isLayerComponent('schemas')).toBe(false);
    expect(isLayerComponent(undefined)).toBe(false);
  });
});
