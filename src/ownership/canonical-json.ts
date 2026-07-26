export function canonicalJson(value: Record<string, unknown>): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}
