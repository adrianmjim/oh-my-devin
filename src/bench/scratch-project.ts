export interface ScratchProject {
  readonly dir: string;
  cleanup(): Promise<void>;
}
