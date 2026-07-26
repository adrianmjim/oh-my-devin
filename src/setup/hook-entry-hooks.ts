export function hookEntryHooks(entry: unknown): readonly unknown[] {
  const readable: boolean = typeof entry === 'object' && entry !== null;
  const hooks: unknown = readable
    ? (entry as Record<string, unknown>)['hooks']
    : undefined;
  return Array.isArray(hooks) ? (hooks as readonly unknown[]) : [];
}
