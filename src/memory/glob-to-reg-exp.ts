export function globToRegExp(glob: string): RegExp {
  let source: string = '';
  let index: number = 0;
  while (index < glob.length) {
    const character: string = glob.charAt(index);
    const doubled: boolean = character === '*' && glob.charAt(index + 1) === '*';
    const rooted: boolean = doubled && glob.charAt(index + 2) === '/';
    if (rooted) {
      source = `${source}(?:.*/)?`;
      index = index + 3;
    } else if (doubled) {
      source = `${source}.*`;
      index = index + 2;
    } else if (character === '*') {
      source = `${source}[^/]*`;
      index = index + 1;
    } else if (character === '?') {
      source = `${source}[^/]`;
      index = index + 1;
    } else {
      source = `${source}${character.replace(/[.+^${}()|[\]\\]/g, '\\$&')}`;
      index = index + 1;
    }
  }
  return new RegExp(`^${source}$`);
}
