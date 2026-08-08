import type { ApprovalPosture } from '../contract/approval-posture';

export interface PromptTurn {
  readonly prompt: string;
  readonly agentConfigPath: string;
  readonly model: string | null;
  readonly posture: ApprovalPosture;
  readonly resumeSessionId: string | null;
}
