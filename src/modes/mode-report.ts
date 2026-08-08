import type { ModeClearedReport } from './mode-cleared-report';
import type { ModeDisplacedReport } from './mode-displaced-report';
import type { ModeJoinedReport } from './mode-joined-report';
import type { ModeRefusedReport } from './mode-refused-report';

export type ModeReport =
  | ModeJoinedReport
  | ModeDisplacedReport
  | ModeRefusedReport
  | ModeClearedReport;
