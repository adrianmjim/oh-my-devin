import type { MergeTarget } from './merge-target';
import type { RefusedTarget } from './refused-target';
import type { RegistryTarget } from './registry-target';

export type ResolvedTarget = MergeTarget | RegistryTarget | RefusedTarget;
