import { tokenizeLensValue } from './tokenize-lens-value';

export function domainWithinLens(domain: string, lens: string): boolean {
  const lensTokens: ReadonlySet<string> = new Set(tokenizeLensValue(lens));
  const domainTokens: readonly string[] = tokenizeLensValue(domain);
  if (domainTokens.length === 0) {
    return false;
  }
  return domainTokens.every((token: string): boolean => lensTokens.has(token));
}
