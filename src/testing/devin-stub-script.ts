import type { CommandResult } from '../engine/command-result';

export interface DevinStubScript {
  readonly turns: readonly CommandResult[];
  readonly listResponse: CommandResult | null;
}
