import type { CommandResult } from '../engine/command-result';
import type { ArtifactWrite } from './artifact-write';

export interface DevinStubScript {
  readonly turns: readonly CommandResult[];
  readonly listResponse: CommandResult | null;
  readonly listResponses?: readonly CommandResult[];
  readonly artifactWrites?: readonly ArtifactWrite[];
}
