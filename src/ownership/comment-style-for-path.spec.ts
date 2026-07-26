import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { commentStyleForPath } from './comment-style-for-path';

describe('commentStyleForPath', () => {
  it('frames markdown in an html comment', () => {
    expect(commentStyleForPath(join('.devin', 'skills', 'SKILL.md'))).toBe(
      'markdown',
    );
  });

  it('frames yaml in a hash comment', () => {
    expect(commentStyleForPath(join('.devin', 'teams', 'default.yaml'))).toBe(
      'yaml',
    );
    expect(commentStyleForPath('config.yml')).toBe('yaml');
  });

  it('frames anything else in a double-slash comment', () => {
    expect(commentStyleForPath(join('.devin', 'hooks', 'omd-mode.mjs'))).toBe(
      'script',
    );
  });
});
