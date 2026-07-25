import { createHash } from 'node:crypto';
import { normalizeForDigest } from './normalize-for-digest';

const DIGEST_LENGTH: number = 32;

export function digestContent(content: string): string {
  const hex: string = createHash('sha256')
    .update(normalizeForDigest(content), 'utf8')
    .digest('hex');
  return `sha256:${hex.slice(0, DIGEST_LENGTH)}`;
}
