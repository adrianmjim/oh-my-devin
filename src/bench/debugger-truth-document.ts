import type { DebuggerTruthItem } from './debugger-truth-item';

export interface DebuggerTruthDocument {
  readonly role: 'debugger';
  readonly causes: readonly DebuggerTruthItem[];
}
