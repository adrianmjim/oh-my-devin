export function hookCommandOf(hook: unknown): string | null {
  const readable: boolean = typeof hook === 'object' && hook !== null;
  const record: Record<string, unknown> | null = readable
    ? (hook as Record<string, unknown>)
    : null;
  const command: unknown = record?.['command'];
  return record?.['type'] === 'command' && typeof command === 'string'
    ? command
    : null;
}
