import type { GateDecision } from '../pipeline/gate-decision';

export interface GateWaitResolvedEvent {
  readonly type: 'gateWaitResolved';
  readonly timestamp: number;
  readonly stage: string;
  readonly decision: GateDecision;
}
