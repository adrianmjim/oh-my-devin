import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS } from '../layer/layer-component';
import { USER_LEVEL_SUPPORTED } from './user-level-supported';

describe('USER_LEVEL_SUPPORTED', () => {
  it('lists the components with a verified user-level location', () => {
    expect(USER_LEVEL_SUPPORTED).toEqual(['rules', 'roles', 'skills', 'hooks']);
  });

  it('holds only declared layer components', () => {
    for (const component of USER_LEVEL_SUPPORTED) {
      expect(ALL_LAYER_COMPONENTS).toContain(component);
    }
  });

  it('leaves teams unsupported at user level', () => {
    expect(USER_LEVEL_SUPPORTED).not.toContain('teams');
  });
});
