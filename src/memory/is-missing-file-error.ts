export function isMissingFileError(value: unknown): boolean {
  return value instanceof Error && 'code' in value && value.code === 'ENOENT';
}
