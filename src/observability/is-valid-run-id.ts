import { SAFE_SEGMENT_PATTERN } from './safe-segment-pattern';

export function isValidRunId(value: string): boolean {
  return value !== '.' && value !== '..' && SAFE_SEGMENT_PATTERN.test(value);
}
