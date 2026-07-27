import { HEADING_PATTERN } from './heading-pattern';

export function isHeadingLine(line: string): boolean {
  return HEADING_PATTERN.test(line);
}
