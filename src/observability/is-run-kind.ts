export function isRunKind(value: unknown): boolean {
  return value === 'single-role' || value === 'pipeline';
}
