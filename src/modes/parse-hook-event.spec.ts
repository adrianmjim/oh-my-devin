import { describe, expect, it } from 'vitest';
import type { HookEvent } from './hook-event';
import { parseHookEvent } from './parse-hook-event';

describe('parseHookEvent', () => {
  it('reads the session id every payload carries', () => {
    const event: HookEvent = parseHookEvent(
      JSON.stringify({ session_id: 'sess-1' }),
    );

    expect(event).toEqual({ sessionId: 'sess-1', command: null });
  });

  it('reads the command a tool-use payload carries', () => {
    const event: HookEvent = parseHookEvent(
      JSON.stringify({
        session_id: 'sess-1',
        tool_input: { command: 'omd mode set plan' },
      }),
    );

    expect(event).toEqual({
      sessionId: 'sess-1',
      command: 'omd mode set plan',
    });
  });

  it('reads nothing out of an unparseable payload', () => {
    expect(parseHookEvent('not json at all')).toEqual({
      sessionId: null,
      command: null,
    });
  });

  it('reads nothing out of an empty payload', () => {
    expect(parseHookEvent('')).toEqual({ sessionId: null, command: null });
  });

  it('reads no session id of the wrong type', () => {
    expect(parseHookEvent(JSON.stringify({ session_id: 7 })).sessionId).toBe(
      null,
    );
  });

  it('reads no command when the tool input carries none', () => {
    expect(
      parseHookEvent(
        JSON.stringify({ session_id: 'sess-1', tool_input: { path: 'a.ts' } }),
      ).command,
    ).toBeNull();
  });
});
