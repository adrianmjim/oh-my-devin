import { COMMENT_KEY } from './comment-key';

export function withoutComment(
  document: Record<string, unknown>,
): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(document)) {
    if (key !== COMMENT_KEY) {
      copy[key] = value;
    }
  }
  return copy;
}
