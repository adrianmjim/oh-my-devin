export interface RepairAttemptedEvent {
  readonly type: 'repairAttempted';
  readonly timestamp: number;
  readonly turnIndex: number;
}
