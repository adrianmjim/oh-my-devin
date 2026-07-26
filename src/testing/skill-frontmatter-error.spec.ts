import { describe, expect, it } from 'vitest';
import { SkillFrontmatterError } from './skill-frontmatter-error';

describe('SkillFrontmatterError', () => {
  it('is an error carrying its message', () => {
    const error: SkillFrontmatterError = new SkillFrontmatterError(
      'no frontmatter',
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('no frontmatter');
  });

  it('names itself so it survives serialization', () => {
    expect(new SkillFrontmatterError('x').name).toBe('SkillFrontmatterError');
  });
});
