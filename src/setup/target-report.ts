import type { LayerComponent } from '../layer/layer-component';
import type { TargetOutcome } from './target-outcome';

export interface TargetReport {
  readonly component: LayerComponent;
  readonly path: string;
  readonly outcome: TargetOutcome;
  readonly reason: string | null;
}
