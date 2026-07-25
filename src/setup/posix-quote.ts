export function posixQuote(value: string): string {
  return `'${value.replaceAll("'", "'\\''")}'`;
}
