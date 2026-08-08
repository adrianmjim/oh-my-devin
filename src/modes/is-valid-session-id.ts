import { SAFE_SEGMENT_PATTERN } from '../observability/safe-segment-pattern';

export function isValidSessionId(value: string): boolean {
  return value !== '.' && value !== '..' && SAFE_SEGMENT_PATTERN.test(value);
}
