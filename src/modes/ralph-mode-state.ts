import type { ModeState } from '../setup/mode-state';

export const RALPH_MODE_STATE: ModeState = {
  mode: 'ralph',
  context:
    'ralph mode active: grind a single role through omd run and its validate-repair loop.',
  verification: [
    'validate-repair loop reached a valid artifact or a classified failure',
  ],
};
