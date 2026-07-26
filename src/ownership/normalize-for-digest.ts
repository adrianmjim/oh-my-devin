export function normalizeForDigest(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\n+$/, '');
}
