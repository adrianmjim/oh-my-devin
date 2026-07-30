import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';

export function stageReportFixture(
  stage: PipelineStage,
  overrides: Partial<RunReport>,
): RunReport {
  return {
    runId: `run-${stage}`,
    role: stage,
    task: 'build the widget',
    engine: 'devin-headless',
    sessionId: `s-${stage}`,
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 8,
    wallTimeMs: 0,
    artifactPath: `${stage}.json`,
    writeScope: 'artifact',
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
    ...overrides,
  };
}
