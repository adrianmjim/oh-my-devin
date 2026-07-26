export interface SplitContent {
  readonly preamble: string;
  readonly rest: string;
}

const FRONTMATTER_FENCE: string = '---';

function splitAt(content: string, boundary: number): SplitContent {
  return {
    preamble: content.slice(0, boundary),
    rest: content.slice(boundary),
  };
}

function frontmatterBoundary(content: string): number {
  const lines: readonly string[] = content.split('\n');
  let boundary: number = 0;
  let offset: number = lines[0] === undefined ? 0 : lines[0].length + 1;
  for (const line of lines.slice(1)) {
    if (boundary === 0 && line === FRONTMATTER_FENCE) {
      boundary = offset + line.length + 1;
    }
    offset += line.length + 1;
  }
  return boundary;
}

export function splitPreamble(content: string): SplitContent {
  let split: SplitContent;
  if (content.startsWith('#!')) {
    const lineEnd: number = content.indexOf('\n');
    split =
      lineEnd === -1
        ? { preamble: content, rest: '' }
        : splitAt(content, lineEnd + 1);
  } else if (content.startsWith(`${FRONTMATTER_FENCE}\n`)) {
    const boundary: number = frontmatterBoundary(content);
    split =
      boundary === 0
        ? { preamble: '', rest: content }
        : splitAt(content, boundary);
  } else {
    split = { preamble: '', rest: content };
  }
  return split;
}
