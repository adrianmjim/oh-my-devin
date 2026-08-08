import type { HookEvent } from './hook-event';

export function parseHookEvent(raw: string): HookEvent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  let sessionId: string | null = null;
  let command: string | null = null;
  if (typeof parsed === 'object' && parsed !== null) {
    const payload: Record<string, unknown> = parsed as Record<string, unknown>;
    const identity: unknown = payload['session_id'];
    sessionId = typeof identity === 'string' ? identity : null;
    const input: unknown = payload['tool_input'];
    if (typeof input === 'object' && input !== null) {
      const invoked: unknown = (input as Record<string, unknown>)['command'];
      command = typeof invoked === 'string' ? invoked : null;
    }
  }
  return { sessionId, command };
}
