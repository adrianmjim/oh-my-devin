import { UsageError } from '../run/usage-error';
import type { ModeState } from '../setup/mode-state';
import { MODE_STATE_CATALOG } from './mode-state-catalog';

export function resolveModeState(mode: string): ModeState {
  const state: ModeState | undefined = MODE_STATE_CATALOG.get(mode);
  if (state === undefined) {
    const known: string = [...MODE_STATE_CATALOG.keys()].join(', ');
    throw new UsageError(`unknown mode "${mode}" (expected: ${known})`);
  }
  return state;
}
