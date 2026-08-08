import { EXCLUSIVE_MODES } from './exclusive-modes';
import type { ModeExclusivity } from './mode-exclusivity';
import { STATELESS_MODES } from './stateless-modes';

export function modeExclusivityOf(mode: string): ModeExclusivity {
  let exclusivity: ModeExclusivity = 'unclassed';
  if (EXCLUSIVE_MODES.includes(mode)) {
    exclusivity = 'exclusive';
  } else if (STATELESS_MODES.includes(mode)) {
    exclusivity = 'stateless';
  }
  return exclusivity;
}
