export function isStringList(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) &&
    value.every((item: unknown): boolean => typeof item === 'string')
  );
}
