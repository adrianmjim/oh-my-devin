import { describe, expect, it } from 'vitest';
import { SKILL_FRONTMATTER_PATTERN } from './skill-frontmatter-pattern';

describe('SKILL_FRONTMATTER_PATTERN', () => {
  it('splits the frontmatter from the skill body', () => {
    const match: RegExpExecArray | null = SKILL_FRONTMATTER_PATTERN.exec(
      '---\nname: x\n---\nbody\n',
    );

    expect(match?.[1]).toBe('name: x');
    expect(match?.[2]).toBe('body\n');
  });

  it('does not match a skill without frontmatter', () => {
    expect(SKILL_FRONTMATTER_PATTERN.exec('body only')).toBeNull();
  });
});
