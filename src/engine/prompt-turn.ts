export interface PromptTurn {
  readonly prompt: string;
  readonly agentConfigPath: string;
  readonly model: string | null;
  readonly resumeSessionId: string | null;
}
