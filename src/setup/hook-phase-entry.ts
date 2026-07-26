import type { HookMatcherEntry } from './hook-matcher-entry';

export function hookPhaseEntry(
  baseCommand: string,
  phase: string,
): HookMatcherEntry {
  return { hooks: [{ type: 'command', command: `${baseCommand} ${phase}` }] };
}
