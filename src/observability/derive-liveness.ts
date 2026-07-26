import type { Liveness } from './liveness';

export function deriveLiveness(
  stampedAt: number | null,
  now: number,
  thresholdMs: number,
): Liveness {
  if (stampedAt === null) {
    return 'stalled';
  }
  const age: number = now - stampedAt;
  return age > thresholdMs ? 'stalled' : 'running';
}
