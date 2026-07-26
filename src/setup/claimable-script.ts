import { CLAIMABLE_SCRIPT_OUTCOMES } from './claimable-script-outcomes';
import type { RegistryTarget } from './registry-target';
import type { TargetOutcome } from './target-outcome';

export function claimableScript(
  target: RegistryTarget,
  outcomes: ReadonlyMap<string, TargetOutcome>,
): boolean {
  const scriptOutcome: TargetOutcome | undefined = outcomes.get(
    target.scriptPath,
  );
  return (
    scriptOutcome !== undefined && CLAIMABLE_SCRIPT_OUTCOMES.has(scriptOutcome)
  );
}
