import type { ModeActivation } from '../modes/mode-activation';
import { readSessionSlots } from '../modes/read-session-slots';
import type { SessionId } from '../modes/session-id';
import type { EnforcementLevel } from './enforcement-level';
import { raiseLevel } from './raise-level';
import { resolveConfiguredLevel } from './resolve-configured-level';

export async function resolveEffectiveLevel(
  baseDir: string,
  userConfigFile: string,
  sessionId: SessionId | null,
): Promise<EnforcementLevel> {
  const configured: EnforcementLevel = await resolveConfiguredLevel(
    baseDir,
    userConfigFile,
  );
  const held: readonly ModeActivation[] =
    sessionId === null ? [] : await readSessionSlots(baseDir, sessionId);
  return raiseLevel(
    configured,
    held.map((activation: ModeActivation): string => activation.mode),
  );
}
