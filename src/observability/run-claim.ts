export interface RunClaim {
  readonly workingDirectory: string;
  readonly worktreeProvisioned: boolean;
  readonly sessionId: string | null;
}
