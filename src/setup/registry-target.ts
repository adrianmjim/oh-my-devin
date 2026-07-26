import type { HookRegistryShape } from './hook-registry-shape';
import type { HooksEventMap } from './hooks-event-map';

export interface RegistryTarget {
  readonly kind: 'registry';
  readonly component: 'hooks';
  readonly absolutePath: string;
  readonly reportPath: string;
  readonly shape: HookRegistryShape;
  readonly scriptPath: string;
  readonly hooksMap: HooksEventMap;
  readonly legacyCommands: readonly string[];
}
