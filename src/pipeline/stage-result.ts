import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { RunReport } from '../outcome/run-report';

export interface StageResult {
  readonly report: RunReport;
  readonly produced: ReadonlyMap<HandoffArtifactName, string>;
}
