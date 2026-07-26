import type { DeliberationInput } from './deliberation-input';

export function wallTimeExceeded(
  input: DeliberationInput,
  start: number,
): boolean {
  const cap: number | null = input.council.tunables.wallTimeMs;
  if (cap === null) {
    return false;
  }
  return input.clock() - start >= cap;
}
