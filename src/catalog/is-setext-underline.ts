import { SETEXT_UNDERLINE_PATTERN } from './setext-underline-pattern';

export function isSetextUnderline(line: string): boolean {
  return SETEXT_UNDERLINE_PATTERN.test(line);
}
