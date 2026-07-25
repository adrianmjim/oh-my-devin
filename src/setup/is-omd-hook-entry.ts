import { HOOK_SCRIPT_FILENAME } from './setup-templates';

const WHITESPACE_PATTERN: RegExp = /\s+/;
const QUOTE_EDGE_PATTERN: RegExp = /^["']+|["']+$/g;
const PATH_SEPARATOR_PATTERN: RegExp = /[/\\]/;

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

function isHookScriptToken(token: string): boolean {
  const segments: readonly string[] = token
    .replace(QUOTE_EDGE_PATTERN, '')
    .split(PATH_SEPARATOR_PATTERN);
  return segments[segments.length - 1] === HOOK_SCRIPT_FILENAME;
}

function invokesHookScript(hook: unknown): boolean {
  const tokens: readonly string[] =
    commandOf(hook)?.split(WHITESPACE_PATTERN) ?? [];
  return tokens.some(isHookScriptToken);
}

export function isOmdHookEntry(entry: unknown): boolean {
  const hooks: readonly unknown[] = hooksOf(entry);
  return hooks.length > 0 && hooks.every(invokesHookScript);
}
