import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS } from '../layer/layer-component';
import { SCOPE_HINT } from './scope-hint';

describe('SCOPE_HINT', () => {
  it('restates the accepted answers', () => {
    expect(SCOPE_HINT).toContain('"full"');
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(SCOPE_HINT).toContain(component);
    }
  });

  it('ends with a newline so the prompt reappears on its own line', () => {
    expect(SCOPE_HINT.endsWith('\n')).toBe(true);
  });
});
