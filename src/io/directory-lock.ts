export interface DirectoryLock {
  readonly dir: string;
  readonly staleMs: number;
  readonly waitMs: number;
}
