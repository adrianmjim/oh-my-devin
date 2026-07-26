import type { MergeOutcome } from '../ownership/merge-outcome';
import { mergeHookRegistry } from './merge-hook-registry';
import type { RegistryTarget } from './registry-target';

export function mergeRegistryTarget(
  target: RegistryTarget,
  existing: string | null,
): MergeOutcome {
  return mergeHookRegistry({
    existing,
    shape: target.shape,
    hooksMap: target.hooksMap,
    legacyCommands: target.legacyCommands,
  });
}
