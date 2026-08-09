import type { RunId } from '../observability/run-id';
import { claimSessionIdentity } from './claim-session-identity';
import type { ExclusivityOutcome } from './exclusivity-outcome';
import type { ModeActivation } from './mode-activation';
import type { ModeReport } from './mode-report';
import { MODE_STALENESS_THRESHOLD_MS } from './mode-staleness-threshold-ms';
import { pruneStaleSessions } from './prune-stale-sessions';
import { readLiveActivations } from './read-live-activations';
import { readSessionSlots } from './read-session-slots';
import { removeActivation } from './remove-activation';
import { resolveExclusivity } from './resolve-exclusivity';
import type { SessionId } from './session-id';
import { upsertActivation } from './upsert-activation';
import { withModeStateLock } from './with-mode-state-lock';
import { writeSessionSlots } from './write-session-slots';

export async function setSessionMode(
  baseDir: string,
  mode: string,
  runId: RunId | null,
  invocation: string,
  now: number,
): Promise<ModeReport> {
  return withModeStateLock(baseDir, async (): Promise<ModeReport> => {
    await pruneStaleSessions(baseDir, now, MODE_STALENESS_THRESHOLD_MS);
    const sessionId: SessionId | null = await claimSessionIdentity(
      baseDir,
      invocation,
      now,
      MODE_STALENESS_THRESHOLD_MS,
    );
    let report: ModeReport = {
      kind: 'refused',
      mode,
      reason: 'unattributable',
      holder: null,
    };
    if (sessionId !== null) {
      const live: readonly ModeActivation[] = await readLiveActivations(
        baseDir,
        now,
        MODE_STALENESS_THRESHOLD_MS,
      );
      const outcome: ExclusivityOutcome = resolveExclusivity(
        live,
        (): boolean => true,
        mode,
        sessionId,
      );
      if (outcome !== null && outcome.kind === 'refused') {
        report = outcome;
      } else {
        const held: readonly ModeActivation[] = await readSessionSlots(
          baseDir,
          sessionId,
        );
        const kept: readonly ModeActivation[] =
          outcome === null ? held : removeActivation(held, outcome.displaced);
        const activation: ModeActivation = {
          mode,
          sessionId,
          activatedAt: now,
          correlatedRunId: runId,
        };
        await writeSessionSlots(
          baseDir,
          sessionId,
          upsertActivation(kept, activation),
        );
        const joined: ModeReport = {
          kind: 'joined',
          mode,
          alongside: kept
            .filter((slot: ModeActivation): boolean => slot.mode !== mode)
            .map((slot: ModeActivation): string => slot.mode),
        };
        report = outcome ?? joined;
      }
    }
    return report;
  });
}
