import type { MergeOutcome } from '../ownership/merge-outcome';
import { claimableScript } from './claimable-script';
import { mergeByStrategy } from './merge-by-strategy';
import { mergeRegistryTarget } from './merge-registry-target';
import type { MergeTarget } from './merge-target';
import { readIfExists } from './read-if-exists';
import type { RegistryTarget } from './registry-target';
import type { TargetOutcome } from './target-outcome';
import { UNOWNED_HOOK_SCRIPT_REASON } from './unowned-hook-script-reason';

export async function resolveMergeOutcome(
  target: MergeTarget | RegistryTarget,
  outcomes: ReadonlyMap<string, TargetOutcome>,
): Promise<MergeOutcome> {
  const existing: string | null = await readIfExists(target.absolutePath);
  let outcome: MergeOutcome;
  if (target.kind === 'merge') {
    outcome = mergeByStrategy(target, existing);
  } else if (claimableScript(target, outcomes)) {
    outcome = mergeRegistryTarget(target, existing);
  } else {
    outcome = { kind: 'blocked', reason: UNOWNED_HOOK_SCRIPT_REASON };
  }
  return outcome;
}
