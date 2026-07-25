import { HOOK_PHASES, HOOK_SCRIPT_FILENAME } from './setup-templates';

const PATH_SEPARATOR_PATTERN: RegExp = /[/\\]/;
const NODE_INVOCATION_PATTERN: RegExp = new RegExp(
  `^node (?:'([^']*)'|"([^"]*)"|(\\S+)) (?:${HOOK_PHASES.join('|')})$`,
);

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

function invokedScriptOf(command: string): string | null {
  const match: RegExpExecArray | null = NODE_INVOCATION_PATTERN.exec(command);
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function invokesHookScript(hook: unknown): boolean {
  const command: string | null = commandOf(hook);
  const script: string | null =
    command === null ? null : invokedScriptOf(command);
  const segments: readonly string[] =
    script === null ? [] : script.split(PATH_SEPARATOR_PATTERN);
  return segments[segments.length - 1] === HOOK_SCRIPT_FILENAME;
}

export function isOmdHookEntry(entry: unknown): boolean {
  const hooks: readonly unknown[] = hooksOf(entry);
  return hooks.length > 0 && hooks.every(invokesHookScript);
}
