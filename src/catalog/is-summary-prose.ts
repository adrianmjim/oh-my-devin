import { isHeadingLine } from './is-heading-line';
import { isSetextUnderline } from './is-setext-underline';

export function isSummaryProse(line: string, nextLine: string): boolean {
  return (
    line.length > 0 &&
    !isHeadingLine(line) &&
    !isSetextUnderline(line) &&
    !isSetextUnderline(nextLine)
  );
}
