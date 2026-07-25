import { HOOK_SCRIPT_FILENAME } from './setup-templates';

function commandOf(hook: unknown): string | null {
  const readable: boolean = typeof hook === 'object' && hook !== null;
  const command: unknown = readable
    ? (hook as Record<string, unknown>)['command']
    : undefined;
  return typeof command === 'string' ? command : null;
}

function hooksOf(entry: unknown): readonly unknown[] {
  const readable: boolean = typeof entry === 'object' && entry !== null;
  const hooks: unknown = readable
    ? (entry as Record<string, unknown>)['hooks']
    : undefined;
  return Array.isArray(hooks) ? (hooks as readonly unknown[]) : [];
}

function invokesHookScript(hook: unknown): boolean {
  return commandOf(hook)?.includes(HOOK_SCRIPT_FILENAME) === true;
}

export function isOmdHookEntry(entry: unknown): boolean {
  const hooks: readonly unknown[] = hooksOf(entry);
  return hooks.length > 0 && hooks.every(invokesHookScript);
}
