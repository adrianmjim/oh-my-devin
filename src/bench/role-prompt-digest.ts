import { createHash } from 'node:crypto';

export function rolePromptDigest(promptBody: string): string {
  return createHash('sha256').update(promptBody, 'utf8').digest('hex');
}
