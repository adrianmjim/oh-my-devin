import type { GateDecision } from './gate-decision';
import type { GatePresentation } from './gate-presentation';

export type PipelineGate = (
  presentation: GatePresentation,
) => Promise<GateDecision>;
