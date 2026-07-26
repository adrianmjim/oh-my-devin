import { describe, expect, it } from 'vitest';
import { LEVEL_PROMPT } from './level-prompt';

describe('LEVEL_PROMPT', () => {
  it('asks for the install level and states its default', () => {
    expect(LEVEL_PROMPT).toBe(
      'Install level? [project/user] (default: project) ',
    );
  });

  it('ends with a space so the answer is typed inline', () => {
    expect(LEVEL_PROMPT.endsWith(' ')).toBe(true);
  });
});
