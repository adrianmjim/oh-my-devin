import type { HookRegistryShape } from './hook-registry-shape';
import { HOOKS_KEY } from './hooks-key';

export function hookRegistryEvents(
  shape: HookRegistryShape,
  document: Record<string, unknown>,
): Record<string, unknown> | null {
  const held: unknown = document[HOOKS_KEY];
  const holdsEventMap: boolean =
    typeof held === 'object' && held !== null && !Array.isArray(held);
  let events: Record<string, unknown> | null;
  if (shape === 'document') {
    events = document;
  } else if (held === undefined) {
    events = {};
  } else {
    events = holdsEventMap ? (held as Record<string, unknown>) : null;
  }
  return events;
}
