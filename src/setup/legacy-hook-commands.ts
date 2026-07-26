import { HOOK_PHASES } from './setup-templates';

export function legacyHookCommands(scriptPath: string): readonly string[] {
  return HOOK_PHASES.map(
    (phase: string): string => `node "${scriptPath}" ${phase}`,
  );
}
