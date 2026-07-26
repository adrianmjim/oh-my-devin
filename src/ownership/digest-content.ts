import { createHash } from 'node:crypto';
import { DIGEST_LENGTH } from './digest-length';
import { normalizeForDigest } from './normalize-for-digest';

export function digestContent(content: string): string {
  const hex: string = createHash('sha256')
    .update(normalizeForDigest(content), 'utf8')
    .digest('hex');
  return `sha256:${hex.slice(0, DIGEST_LENGTH)}`;
}
