import { PLACEHOLDER_VALUES } from './placeholder-values';

export function substitutePlaceholder(token: string): string {
  return PLACEHOLDER_VALUES[token] ?? token;
}
