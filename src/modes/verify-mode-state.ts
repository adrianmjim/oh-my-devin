import type { ModeState } from '../setup/mode-state';

export const VERIFY_MODE_STATE: ModeState = {
  mode: 'verify',
  context:
    'verify mode active: check the artifact against its contract and record evidence.',
  verification: ['verification evidence recorded'],
};
