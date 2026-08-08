export function orEmptyList(values: readonly string[]): string {
  return values.length === 0 ? '(none)' : values.join(', ');
}
