import type { ArchitectStep } from './architect-step';

export interface ArchitectArtifact {
  readonly approach: string;
  readonly steps: readonly ArchitectStep[];
}
