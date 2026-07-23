export interface GateWaitEnteredEvent {
  readonly type: 'gateWaitEntered';
  readonly timestamp: number;
  readonly stage: string;
}
