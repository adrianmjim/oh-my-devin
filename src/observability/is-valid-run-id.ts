const SAFE_SEGMENT_PATTERN: RegExp = /^[A-Za-z0-9._-]+$/u;

export function isValidRunId(value: string): boolean {
  return value !== '.' && value !== '..' && SAFE_SEGMENT_PATTERN.test(value);
}
