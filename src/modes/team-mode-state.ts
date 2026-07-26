import type { ModeState } from '../setup/mode-state';

export const TEAM_MODE_STATE: ModeState = {
  mode: 'team',
  context:
    'team mode active: run the declared team through the fixed three-stage pipeline.',
  verification: ['pipeline terminal outcome reported'],
};
