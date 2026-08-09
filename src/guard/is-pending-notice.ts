import type { PendingNotice } from './pending-notice';

export function isPendingNotice(value: unknown): value is PendingNotice {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate: Partial<PendingNotice> = value;
  return (
    typeof candidate.tool === 'string' &&
    typeof candidate.filePath === 'string' &&
    typeof candidate.noticedAt === 'number'
  );
}
