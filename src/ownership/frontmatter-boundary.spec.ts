import { describe, expect, it } from 'vitest';
import { frontmatterBoundary } from './frontmatter-boundary';

describe('frontmatterBoundary', () => {
  it('ends just past the closing fence', () => {
    const content: string = '---\nname: x\n---\nbody\n';

    expect(content.slice(0, frontmatterBoundary(content))).toBe(
      '---\nname: x\n---\n',
    );
  });

  it('is zero when the frontmatter is never closed', () => {
    expect(frontmatterBoundary('---\nname: x\n')).toBe(0);
  });

  it('takes the first closing fence, not a later one', () => {
    const content: string = '---\na\n---\nb\n---\n';

    expect(frontmatterBoundary(content)).toBe('---\na\n---\n'.length);
  });
});
