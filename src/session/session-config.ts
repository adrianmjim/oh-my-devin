import type { ApprovalPosture } from '../contract/approval-posture';

export interface SessionConfig {
  readonly agentConfigPath: string;
  readonly model: string | null;
  readonly posture: ApprovalPosture;
  readonly workingDirectory: string;
  readonly env: NodeJS.ProcessEnv | null;
}
