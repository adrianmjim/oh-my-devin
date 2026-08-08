import type { ModeDisplacedReport } from './mode-displaced-report';
import type { ModeRefusedReport } from './mode-refused-report';

export type ExclusivityOutcome = ModeRefusedReport | ModeDisplacedReport | null;
