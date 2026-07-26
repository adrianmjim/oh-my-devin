import { frontmatterBoundary } from './frontmatter-boundary';
import { FRONTMATTER_FENCE } from './frontmatter-fence';
import type { SplitContent } from './split-content';
import { splitContentAt } from './split-content-at';

export function splitPreamble(content: string): SplitContent {
  let split: SplitContent;
  if (content.startsWith('#!')) {
    const lineEnd: number = content.indexOf('\n');
    split =
      lineEnd === -1
        ? { preamble: content, rest: '' }
        : splitContentAt(content, lineEnd + 1);
  } else if (content.startsWith(`${FRONTMATTER_FENCE}\n`)) {
    const boundary: number = frontmatterBoundary(content);
    split =
      boundary === 0
        ? { preamble: '', rest: content }
        : splitContentAt(content, boundary);
  } else {
    split = { preamble: '', rest: content };
  }
  return split;
}
