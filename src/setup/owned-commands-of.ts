import { CLAIMED_EVENTS } from './claimed-events';
import type { HooksEventMap } from './hooks-event-map';

export function ownedCommandsOf(
  hooksMap: HooksEventMap,
  legacyCommands: readonly string[],
): ReadonlySet<string> {
  const commands: Set<string> = new Set<string>(legacyCommands);
  for (const event of CLAIMED_EVENTS) {
    for (const entry of hooksMap[event]) {
      for (const hook of entry.hooks) {
        commands.add(hook.command);
      }
    }
  }
  return commands;
}
