import { LIVENESS_STALL_THRESHOLD_MS } from '../observability/liveness-stall-threshold-ms';
import { loadRunSnapshot } from '../observability/load-run-snapshot';
import type { RunSnapshot } from '../observability/run-snapshot';
import type { ModeState } from '../setup/mode-state';
import type { ModeActivation } from './mode-activation';
import { MODE_STATE_CATALOG } from './mode-state-catalog';

export async function deriveModeHold(
  baseDir: string,
  activation: ModeActivation,
  now: number,
): Promise<string | null> {
  let hold: string | null = null;
  if (activation.correlatedRunId === null) {
    const state: ModeState | undefined = MODE_STATE_CATALOG.get(
      activation.mode,
    );
    if (state !== undefined && state.verification.length > 0) {
      hold = `mode ${activation.mode} has unmet verification criteria: ${state.verification.join('; ')}`;
    }
  } else {
    let snapshot: RunSnapshot | null;
    try {
      snapshot = await loadRunSnapshot(
        baseDir,
        activation.correlatedRunId,
        now,
        LIVENESS_STALL_THRESHOLD_MS,
      );
    } catch {
      snapshot = null;
    }
    if (snapshot === null) {
      hold = `mode ${activation.mode} holds run ${activation.correlatedRunId}, which cannot be verified`;
    } else if (snapshot.state !== 'succeeded' && snapshot.state !== 'failed') {
      hold = `mode ${activation.mode} holds run ${activation.correlatedRunId}, which is ${snapshot.state}`;
    }
  }
  return hold;
}
