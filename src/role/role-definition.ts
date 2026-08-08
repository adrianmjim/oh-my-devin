import type { MemoryClass } from '../memory/memory-class';
import type { ContextPolicy } from './context-policy';
import type { EngineKind } from './engine-kind';
import type { RolePermissions } from './role-permissions';
import type { WriteScope } from './write-scope';

export interface RoleDefinition {
  readonly name: string;
  readonly engine: EngineKind;
  readonly agentType: string | null;
  readonly model: string | null;
  readonly tools: readonly string[];
  readonly permissions: RolePermissions;
  readonly outputArtifact: string;
  readonly outputSchema: string;
  readonly maxTurns: number;
  readonly contextPolicy: ContextPolicy;
  readonly wallTimeMs: number | null;
  readonly writeScope: WriteScope;
  readonly memorySelection: readonly MemoryClass[];
  readonly promptBody: string;
}
