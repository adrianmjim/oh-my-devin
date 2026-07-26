export function isStringOrNull(value: unknown): boolean {
  return value === null || typeof value === 'string';
}
