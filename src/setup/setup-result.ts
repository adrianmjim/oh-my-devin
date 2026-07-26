import type { LayerComponent } from '../layer/layer-component';

export type TargetOutcome =
  'created' | 'updated' | 'unchanged' | 'preserved' | 'conflicted' | 'blocked';

export interface TargetReport {
  readonly component: LayerComponent;
  readonly path: string;
  readonly outcome: TargetOutcome;
  readonly reason: string | null;
}

export interface SetupRefusal {
  readonly component: LayerComponent;
  readonly reason: string;
}

export interface SetupResult {
  readonly targets: readonly TargetReport[];
  readonly refusals: readonly SetupRefusal[];
}
