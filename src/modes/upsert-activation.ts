import type { ModeActivation } from './mode-activation';

export function upsertActivation(
  activations: readonly ModeActivation[],
  candidate: ModeActivation,
): readonly ModeActivation[] {
  const held: readonly ModeActivation[] = activations.map(
    (slot: ModeActivation): ModeActivation =>
      slot.mode === candidate.mode ? candidate : slot,
  );
  const replaced: boolean = activations.some(
    (slot: ModeActivation): boolean => slot.mode === candidate.mode,
  );
  return replaced ? held : [...held, candidate];
}
