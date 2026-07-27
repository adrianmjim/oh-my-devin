export function goodExampleBlock(promptBody: string): string {
  const lines: readonly string[] = promptBody.split('\n');
  const start: number = lines.findIndex((line: string): boolean =>
    line.startsWith('Good —'),
  );
  const block: string[] = [];
  let index: number = start + 1;
  while (start !== -1 && index < lines.length) {
    const line: string = lines[index] ?? '';
    if (line.startsWith('    ')) {
      block.push(line.trim());
      index += 1;
    } else if (block.length === 0 && line.trim() === '') {
      index += 1;
    } else {
      index = lines.length;
    }
  }
  return block.join(' ');
}
