import type { ModeActivation } from './mode-activation';

export function removeActivation(
  activations: readonly ModeActivation[],
  mode: string,
): readonly ModeActivation[] {
  return activations.filter(
    (slot: ModeActivation): boolean => slot.mode !== mode,
  );
}
