export const BASE_DELAY_MS = 1000;
export const MAX_ATTEMPTS = 5;

export function delayFor(attempt) {
  return BASE_DELAY_MS * 2 ** (attempt - 1);
}
