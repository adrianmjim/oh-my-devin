export interface RunExecutionContext {
  readonly workingDirectory: string;
  readonly provisionedWorktree: boolean;
  readonly memoryBaseDir?: string;
}
