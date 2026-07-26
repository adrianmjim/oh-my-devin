import { describe, expect, it } from 'vitest';
import type { SplitContent } from './split-content';
import { splitPreamble } from './split-preamble';

describe('splitPreamble', () => {
  it('splits yaml frontmatter off the body', () => {
    const split: SplitContent = splitPreamble(
      '---\nname: reviewer\n---\n\nBody line.\n',
    );

    expect(split.preamble).toBe('---\nname: reviewer\n---\n');
    expect(split.rest).toBe('\nBody line.\n');
  });

  it('splits a shebang off the body', () => {
    const split: SplitContent = splitPreamble(
      "#!/usr/bin/env node\nimport { readFileSync } from 'node:fs';\n",
    );

    expect(split.preamble).toBe('#!/usr/bin/env node\n');
    expect(split.rest).toBe("import { readFileSync } from 'node:fs';\n");
  });

  it('reports no preamble for content that has neither', () => {
    const split: SplitContent = splitPreamble('# A heading\n\nProse.\n');

    expect(split.preamble).toBe('');
    expect(split.rest).toBe('# A heading\n\nProse.\n');
  });

  it('reports no preamble for an unterminated frontmatter fence', () => {
    const split: SplitContent = splitPreamble('---\nname: reviewer\n');

    expect(split.preamble).toBe('');
    expect(split.rest).toBe('---\nname: reviewer\n');
  });

  it('rejoins to exactly the content it was given', () => {
    const inputs: readonly string[] = [
      '---\nname: reviewer\n---\nBody.\n',
      '#!/usr/bin/env node\ncode\n',
      'plain\n',
      '',
    ];

    for (const content of inputs) {
      const split: SplitContent = splitPreamble(content);

      expect(`${split.preamble}${split.rest}`).toBe(content);
    }
  });
});
