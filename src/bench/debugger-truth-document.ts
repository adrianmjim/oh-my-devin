import type { DebuggerTruthItem } from './debugger-truth-item';
import type { KeywordItem } from './keyword-item';

export interface DebuggerTruthDocument {
  readonly role: 'debugger';
  readonly causes: readonly DebuggerTruthItem[];
  readonly evidence: readonly KeywordItem[];
  readonly eliminations: readonly KeywordItem[];
}
