export function normalizeBenchText(text: string): string {
  const collapsed: string = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return collapsed === '' ? ' ' : ` ${collapsed} `;
}
