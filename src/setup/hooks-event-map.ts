import type { HookMatcherEntry } from './hook-matcher-entry';

export interface HooksEventMap {
  readonly SessionStart: readonly HookMatcherEntry[];
  readonly UserPromptSubmit: readonly HookMatcherEntry[];
  readonly Stop: readonly HookMatcherEntry[];
  readonly PreToolUse: readonly HookMatcherEntry[];
}
