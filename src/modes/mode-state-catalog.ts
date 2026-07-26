import type { ModeState } from '../setup/mode-state';
import { AUTOPILOT_MODE_STATE } from './autopilot-mode-state';
import { PLAN_MODE_STATE } from './plan-mode-state';
import { RALPH_MODE_STATE } from './ralph-mode-state';
import { TEAM_MODE_STATE } from './team-mode-state';
import { VERIFY_MODE_STATE } from './verify-mode-state';

export const MODE_STATE_CATALOG: ReadonlyMap<string, ModeState> = new Map<
  string,
  ModeState
>([
  ['autopilot', AUTOPILOT_MODE_STATE],
  ['ralph', RALPH_MODE_STATE],
  ['team', TEAM_MODE_STATE],
  ['plan', PLAN_MODE_STATE],
  ['verify', VERIFY_MODE_STATE],
]);
