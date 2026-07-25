import type { LayerComponent } from './layer-component';
import type { HooksEventMap } from './setup-templates';

export interface FileTarget {
  readonly kind: 'file';
  readonly component: LayerComponent;
  readonly absolutePath: string;
  readonly reportPath: string;
  readonly content: string;
}

export interface HooksMergeTarget {
  readonly kind: 'hooks-merge';
  readonly component: 'hooks';
  readonly scriptAbsolutePath: string;
  readonly scriptReportPath: string;
  readonly scriptContent: string;
  readonly configAbsolutePath: string;
  readonly configReportPath: string;
  readonly hooksMap: HooksEventMap;
}

export interface RefusedTarget {
  readonly kind: 'refused';
  readonly component: LayerComponent;
  readonly reason: string;
}

export type ResolvedTarget = FileTarget | HooksMergeTarget | RefusedTarget;
