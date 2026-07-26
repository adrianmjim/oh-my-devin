import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS } from '../layer/all-layer-components';
import { SCOPE_PROMPT } from './scope-prompt';

describe('SCOPE_PROMPT', () => {
  it('offers the full scope as the default', () => {
    expect(SCOPE_PROMPT).toContain('(default: full)');
  });

  it('names every component that can be selected', () => {
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(SCOPE_PROMPT).toContain(component);
    }
  });

  it('ends with a space so the answer is typed inline', () => {
    expect(SCOPE_PROMPT.endsWith(' ')).toBe(true);
  });
});
