import type { HookEvent } from './hook-event';
import { isValidSessionId } from './is-valid-session-id';

export function parseHookEvent(raw: string): HookEvent {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  let sessionId: string | null = null;
  let command: string | null = null;
  let path: string | null = null;
  let prompt: string | null = null;
  if (typeof parsed === 'object' && parsed !== null) {
    const payload: Record<string, unknown> = parsed as Record<string, unknown>;
    const identity: unknown = payload['session_id'];
    sessionId =
      typeof identity === 'string' && isValidSessionId(identity)
        ? identity
        : null;
    const submitted: unknown = payload['prompt'];
    prompt = typeof submitted === 'string' ? submitted : null;
    const input: unknown = payload['tool_input'];
    if (typeof input === 'object' && input !== null) {
      const invoked: unknown = (input as Record<string, unknown>)['command'];
      command = typeof invoked === 'string' ? invoked : null;
      const touched: unknown = (input as Record<string, unknown>)['file_path'];
      path = typeof touched === 'string' ? touched : null;
    }
  }
  return { sessionId, command, path, prompt };
}
