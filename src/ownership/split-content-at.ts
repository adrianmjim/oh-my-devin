import type { SplitContent } from './split-content';

export function splitContentAt(
  content: string,
  boundary: number,
): SplitContent {
  return {
    preamble: content.slice(0, boundary),
    rest: content.slice(boundary),
  };
}
