export function tokenizeLensValue(value: string): readonly string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token: string): boolean => token.length > 0);
}
