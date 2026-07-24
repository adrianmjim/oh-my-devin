export interface StageStartedEvent {
  readonly type: 'stageStarted';
  readonly timestamp: number;
  readonly stage: string;
  readonly stageIndex: number;
}
