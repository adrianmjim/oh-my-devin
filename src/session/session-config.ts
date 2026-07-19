export interface SessionConfig {
  readonly agentConfigPath: string;
  readonly model: string | null;
  readonly workingDirectory: string;
}
