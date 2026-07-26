import { hookCommandOf } from './hook-command-of';
import { hookEntryHooks } from './hook-entry-hooks';

export function isOmdHookEntry(
  entry: unknown,
  installedCommands: ReadonlySet<string>,
): boolean {
  const hooks: readonly unknown[] = hookEntryHooks(entry);
  return (
    hooks.length > 0 &&
    hooks.every((hook: unknown): boolean => {
      const command: string | null = hookCommandOf(hook);
      return command !== null && installedCommands.has(command);
    })
  );
}
