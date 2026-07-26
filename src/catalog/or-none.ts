export function orNone(values: readonly string[]): string {
  return values.length > 0 ? values.join(', ') : '(none)';
}
