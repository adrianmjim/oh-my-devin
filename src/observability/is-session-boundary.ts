export function isSessionBoundary(value: unknown): boolean {
  return value === 'launch' || value === 'resume';
}
