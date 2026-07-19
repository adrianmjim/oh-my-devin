import type { ContextPolicy } from '../role/context-policy';
import type { EngineKind } from '../role/engine-kind';

export interface RoleListEntry {
  readonly name: string;
  readonly output: string;
  readonly schema: string;
  readonly maxTurns: number;
  readonly context: ContextPolicy;
  readonly engine: EngineKind;
  readonly agentType: string | null;
  readonly model: string | null;
}
