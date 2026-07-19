export interface SessionTurnResult {
  readonly sessionId: string | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
}
