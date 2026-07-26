function commandOf(hook: unknown): string | null {
  const readable: boolean = typeof hook === 'object' && hook !== null;
  const record: Record<string, unknown> | null = readable
    ? (hook as Record<string, unknown>)
    : null;
  const command: unknown = record?.['command'];
  return record?.['type'] === 'command' && typeof command === 'string'
    ? command
    : null;
}

function hooksOf(entry: unknown): readonly unknown[] {
  const readable: boolean = typeof entry === 'object' && entry !== null;
  const hooks: unknown = readable
    ? (entry as Record<string, unknown>)['hooks']
    : undefined;
  return Array.isArray(hooks) ? (hooks as readonly unknown[]) : [];
}

export function isOmdHookEntry(
  entry: unknown,
  installedCommands: ReadonlySet<string>,
): boolean {
  const hooks: readonly unknown[] = hooksOf(entry);
  return (
    hooks.length > 0 &&
    hooks.every((hook: unknown): boolean => {
      const command: string | null = commandOf(hook);
      return command !== null && installedCommands.has(command);
    })
  );
}
