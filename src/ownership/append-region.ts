export function appendRegion(existing: string, framed: string): string {
  const base: string = existing.endsWith('\n') ? existing : `${existing}\n`;
  return `${base}\n${framed}`;
}
