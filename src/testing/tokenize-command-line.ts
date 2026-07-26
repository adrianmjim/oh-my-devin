import { TOKEN_PATTERN } from './token-pattern';

export function tokenizeCommandLine(line: string): readonly string[] {
  const tokens: string[] = [];
  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const quoted: string | undefined = match[1];
    const bare: string | undefined = match[2];
    tokens.push(quoted ?? bare ?? '');
  }
  return tokens;
}
