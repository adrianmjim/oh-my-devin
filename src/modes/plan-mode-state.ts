import type { ModeState } from '../setup/mode-state';

export const PLAN_MODE_STATE: ModeState = {
  mode: 'plan',
  context:
    'plan mode active: produce a plan artifact before implementation begins.',
  verification: ['plan artifact produced'],
};
