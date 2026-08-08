import { SESSION_START_PHASE } from './session-start-phase';
import { STOP_PHASE } from './stop-phase';
import { TOOL_USE_PHASE } from './tool-use-phase';
import { USER_PROMPT_PHASE } from './user-prompt-phase';

export const HOOK_PHASES: readonly string[] = [
  SESSION_START_PHASE,
  USER_PROMPT_PHASE,
  STOP_PHASE,
  TOOL_USE_PHASE,
];
