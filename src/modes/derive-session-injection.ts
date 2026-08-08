import type { ModeState } from '../setup/mode-state';
import { isSessionStale } from './is-session-stale';
import type { ModeActivation } from './mode-activation';
import { MODE_STALENESS_THRESHOLD_MS } from './mode-staleness-threshold-ms';
import { MODE_STATE_CATALOG } from './mode-state-catalog';
import { readSessionSeen } from './read-session-seen';
import { readSessionSlots } from './read-session-slots';
import type { SessionId } from './session-id';
import type { SessionRegistryEntry } from './session-registry-entry';

export async function deriveSessionInjection(
  baseDir: string,
  sessionId: SessionId | null,
  now: number,
): Promise<string> {
  let injected: string = '';
  if (sessionId !== null) {
    const seen: SessionRegistryEntry | null = await readSessionSeen(
      baseDir,
      sessionId,
    );
    const stale: boolean = isSessionStale(
      seen?.lastSeenAt ?? null,
      now,
      MODE_STALENESS_THRESHOLD_MS,
    );
    if (!stale) {
      const held: readonly ModeActivation[] = await readSessionSlots(
        baseDir,
        sessionId,
      );
      injected = held
        .map((slot: ModeActivation): string => {
          const state: ModeState | undefined = MODE_STATE_CATALOG.get(
            slot.mode,
          );
          return state === undefined
            ? ''
            : `Active mode: ${slot.mode}. ${state.context}`;
        })
        .filter((line: string): boolean => line !== '')
        .join('\n');
    }
  }
  return injected;
}
