import type { LayerComponent } from '../layer/layer-component';
import type { MergeStrategy } from '../layer/merge-strategy';
import type { RegionFraming } from '../ownership/region-framing';

export interface MergeTarget {
  readonly kind: 'merge';
  readonly component: LayerComponent;
  readonly absolutePath: string;
  readonly reportPath: string;
  readonly strategy: MergeStrategy;
  readonly framing: RegionFraming;
}
