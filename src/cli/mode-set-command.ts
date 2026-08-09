import type { RunId } from '../observability/run-id';

export interface ModeSetCommand {
  readonly kind: 'mode-set';
  readonly mode: string;
  readonly runId: RunId | null;
  readonly invocation: string;
}
