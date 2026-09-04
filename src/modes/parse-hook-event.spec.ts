import { describe, expect, it } from 'vitest';
import type { HookEvent } from './hook-event';
import { parseHookEvent } from './parse-hook-event';

describe('parseHookEvent', () => {
  it('reads the session id every payload carries', () => {
    const event: HookEvent = parseHookEvent(
      JSON.stringify({ session_id: 'sess-1' }),
    );

    expect(event).toEqual({
      sessionId: 'sess-1',
      command: null,
      tool: null,
      filePath: null,
    });
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
      tool: null,
      filePath: null,
    });
  });

  it('reads nothing out of an unparseable payload', () => {
    expect(parseHookEvent('not json at all')).toEqual({
      sessionId: null,
      command: null,
      tool: null,
      filePath: null,
    });
  });

  it('reads nothing out of an empty payload', () => {
    expect(parseHookEvent('')).toEqual({
      sessionId: null,
      command: null,
      tool: null,
      filePath: null,
    });
  });

  it('reads no session id that is not a safe path segment', () => {
    expect(
      parseHookEvent(JSON.stringify({ session_id: '../../etc' })).sessionId,
    ).toBeNull();
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

  it('reads the tool and target a write payload carries', () => {
    const event: HookEvent = parseHookEvent(
      JSON.stringify({
        session_id: 'sess-1',
        tool_name: 'edit',
        tool_input: { file_path: 'src/index.ts' },
      }),
    );

    expect(event).toEqual({
      sessionId: 'sess-1',
      command: null,
      tool: 'edit',
      filePath: 'src/index.ts',
    });
  });

  it('reads no target out of a payload that names none', () => {
    const event: HookEvent = parseHookEvent(
      JSON.stringify({ session_id: 'sess-1', tool_name: 'exec' }),
    );

    expect(event.tool).toBe('exec');
    expect(event.filePath).toBeNull();
  });

  it('reads no tool or target of the wrong type', () => {
    const event: HookEvent = parseHookEvent(
      JSON.stringify({
        session_id: 'sess-1',
        tool_name: 7,
        tool_input: { file_path: ['a'] },
      }),
    );

    expect(event.tool).toBeNull();
    expect(event.filePath).toBeNull();
  });
});
