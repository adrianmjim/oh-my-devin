import { hookPhaseEntry } from './hook-phase-entry';
import type { HooksEventMap } from './hooks-event-map';
import { SESSION_START_PHASE } from './session-start-phase';
import { STOP_PHASE } from './stop-phase';
import { TOOL_USE_PHASE } from './tool-use-phase';
import { USER_PROMPT_PHASE } from './user-prompt-phase';

export function buildHooksEventMap(baseCommand: string): HooksEventMap {
  return {
    SessionStart: [hookPhaseEntry(baseCommand, SESSION_START_PHASE)],
    UserPromptSubmit: [hookPhaseEntry(baseCommand, USER_PROMPT_PHASE)],
    Stop: [hookPhaseEntry(baseCommand, STOP_PHASE)],
    PreToolUse: [hookPhaseEntry(baseCommand, TOOL_USE_PHASE)],
  };
}
