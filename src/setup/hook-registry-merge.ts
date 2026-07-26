import type { HookRegistryShape } from './hook-registry-shape';
import type { HooksEventMap } from './hooks-event-map';

export interface HookRegistryMerge {
  readonly existing: string | null;
  readonly shape: HookRegistryShape;
  readonly hooksMap: HooksEventMap;
  readonly legacyCommands: readonly string[];
}
