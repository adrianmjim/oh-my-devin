export function isSessionStale(
  lastSeenAt: number | null,
  now: number,
  thresholdMs: number,
): boolean {
  return lastSeenAt === null || now - lastSeenAt > thresholdMs;
}
