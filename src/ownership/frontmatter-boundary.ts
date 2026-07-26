import { FRONTMATTER_FENCE } from './frontmatter-fence';

export function frontmatterBoundary(content: string): number {
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
