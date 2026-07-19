import type { ContextPolicy } from '../role/context-policy';
import type { EngineKind } from '../role/engine-kind';
import type { RolePermissions } from '../role/role-permissions';

export interface RoleContractJson {
  readonly name: string;
  readonly engine: EngineKind;
  readonly agentType: string | null;
  readonly model: string | null;
  readonly tools: readonly string[];
  readonly permissions: RolePermissions;
  readonly output: string;
  readonly schema: string;
  readonly maxTurns: number;
  readonly context: ContextPolicy;
  readonly wallTimeMs: number | null;
  readonly promptSummary: string;
}
