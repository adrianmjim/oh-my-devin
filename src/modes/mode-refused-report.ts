import type { ModeRefusalReason } from './mode-refusal-reason';
import type { SessionModeHolder } from './session-mode-holder';

export interface ModeRefusedReport {
  readonly kind: 'refused';
  readonly mode: string | null;
  readonly reason: ModeRefusalReason;
  readonly holder: SessionModeHolder | null;
}
