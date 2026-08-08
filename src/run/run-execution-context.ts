import type { MemoryComposer } from '../memory/memory-composer';

export interface RunExecutionContext {
  readonly workingDirectory: string;
  readonly provisionedWorktree: boolean;
  readonly composeMemory?: MemoryComposer;
}
