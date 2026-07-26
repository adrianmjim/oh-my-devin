import type { HookCommandEntry } from './hook-command-entry';

export interface HookMatcherEntry {
  readonly hooks: readonly HookCommandEntry[];
}
