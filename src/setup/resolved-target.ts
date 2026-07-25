import type { RegionFraming } from '../ownership/region-framing';
import type { LayerComponent } from './layer-component';
import type { HookRegistryShape } from './merge-hook-registry';
import type { MergeStrategy } from './merge-strategy';
import type { HooksEventMap } from './setup-templates';

export interface MergeTarget {
  readonly kind: 'merge';
  readonly component: LayerComponent;
  readonly absolutePath: string;
  readonly reportPath: string;
  readonly strategy: MergeStrategy;
  readonly framing: RegionFraming;
}

export interface RegistryTarget {
  readonly kind: 'registry';
  readonly component: 'hooks';
  readonly absolutePath: string;
  readonly reportPath: string;
  readonly shape: HookRegistryShape;
  readonly hooksMap: HooksEventMap;
}

export interface RefusedTarget {
  readonly kind: 'refused';
  readonly component: LayerComponent;
  readonly reason: string;
}

export type ResolvedTarget = MergeTarget | RegistryTarget | RefusedTarget;
