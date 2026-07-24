import type { FailureTier } from '../outcome/failure-tier';

export interface StageCompletedEvent {
  readonly type: 'stageCompleted';
  readonly timestamp: number;
  readonly stage: string;
  readonly stageIndex: number;
  readonly valid: boolean;
  readonly failureTier: FailureTier | null;
}
