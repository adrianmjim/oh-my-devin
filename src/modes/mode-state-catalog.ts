import type { ModeState } from '../setup/mode-state';

const TEAM_MODE_STATE: ModeState = {
  mode: 'team',
  context:
    'team mode active: run the declared team through the fixed three-stage pipeline.',
  verification: ['pipeline terminal outcome reported'],
};

const RALPH_MODE_STATE: ModeState = {
  mode: 'ralph',
  context:
    'ralph mode active: grind a single role through omd run and its validate-repair loop.',
  verification: [
    'validate-repair loop reached a valid artifact or a classified failure',
  ],
};

const AUTOPILOT_MODE_STATE: ModeState = {
  mode: 'autopilot',
  context:
    'autopilot mode active: run the team pipeline under the automatic gate policy.',
  verification: ['pipeline terminal outcome reported'],
};

const PLAN_MODE_STATE: ModeState = {
  mode: 'plan',
  context:
    'plan mode active: produce a plan artifact before implementation begins.',
  verification: ['plan artifact produced'],
};

const VERIFY_MODE_STATE: ModeState = {
  mode: 'verify',
  context:
    'verify mode active: check the artifact against its contract and record evidence.',
  verification: ['verification evidence recorded'],
};

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
