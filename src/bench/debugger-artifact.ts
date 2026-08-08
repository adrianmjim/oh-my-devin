import type { DebuggerRootCause } from './debugger-root-cause';

export interface DebuggerArtifact {
  readonly evidence: readonly string[];
  readonly rootCause: DebuggerRootCause | null;
  readonly eliminated: readonly string[];
}
