import { describe, expect, it } from 'vitest';
import { FRONTMATTER_PATTERN } from './frontmatter-pattern';

describe('FRONTMATTER_PATTERN', () => {
  it('splits the frontmatter from the prompt body', () => {
    const match: RegExpExecArray | null = FRONTMATTER_PATTERN.exec(
      '---\nname: x\n---\nbody\n',
    );

    expect(match?.[1]).toBe('name: x');
    expect(match?.[2]).toBe('body\n');
  });

  it('accepts carriage returns', () => {
    expect(FRONTMATTER_PATTERN.exec('---\r\nname: x\r\n---\r\nbody')?.[1]).toBe(
      'name: x',
    );
  });

  it('does not match a definition without frontmatter', () => {
    expect(FRONTMATTER_PATTERN.exec('body only')).toBeNull();
  });
});
