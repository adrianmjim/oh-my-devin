import { HOOK_PHASES } from './hook-phases';

export function legacyHookCommands(scriptPath: string): readonly string[] {
  return HOOK_PHASES.map(
    (phase: string): string => `node "${scriptPath}" ${phase}`,
  );
}
