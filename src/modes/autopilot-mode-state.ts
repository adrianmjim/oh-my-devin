import type { ModeState } from '../setup/mode-state';

export const AUTOPILOT_MODE_STATE: ModeState = {
  mode: 'autopilot',
  context:
    'autopilot mode active: run the team pipeline under the automatic gate policy.',
  verification: ['pipeline terminal outcome reported'],
};
