import { claimSessionIdentity } from './claim-session-identity';
import type { ModeActivation } from './mode-activation';
import type { ModeReport } from './mode-report';
import { MODE_STALENESS_THRESHOLD_MS } from './mode-staleness-threshold-ms';
import { pruneStaleSessions } from './prune-stale-sessions';
import { readSessionSlots } from './read-session-slots';
import type { SessionId } from './session-id';
import { writeSessionSlots } from './write-session-slots';

export async function clearSessionMode(
  baseDir: string,
  mode: string | null,
  invocation: string,
  now: number,
): Promise<ModeReport> {
  await pruneStaleSessions(baseDir, now, MODE_STALENESS_THRESHOLD_MS);
  const sessionId: SessionId | null = await claimSessionIdentity(
    baseDir,
    invocation,
    now,
    MODE_STALENESS_THRESHOLD_MS,
  );
  let report: ModeReport = {
    kind: 'refused',
    mode: mode ?? '',
    reason: 'unattributable',
    holder: null,
  };
  if (sessionId !== null) {
    const held: readonly ModeActivation[] = await readSessionSlots(
      baseDir,
      sessionId,
    );
    const cleared: readonly ModeActivation[] = held.filter(
      (slot: ModeActivation): boolean => mode === null || slot.mode === mode,
    );
    const kept: readonly ModeActivation[] = held.filter(
      (slot: ModeActivation): boolean => mode !== null && slot.mode !== mode,
    );
    await writeSessionSlots(baseDir, sessionId, kept);
    report = {
      kind: 'cleared',
      modes: cleared.map((slot: ModeActivation): string => slot.mode),
    };
  }
  return report;
}
