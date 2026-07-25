export function parseJsonObject(text: string): Record<string, unknown> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  const isObject: boolean =
    typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed);
  return isObject ? (parsed as Record<string, unknown>) : null;
}
