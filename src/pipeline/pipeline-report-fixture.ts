import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import type { GateDecision } from './gate-decision';
import type { PipelineOutcome } from './pipeline-outcome';
import type { PipelineReport } from './pipeline-report';
import type { StageRecord } from './stage-record';

function stageReport(
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
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
    ...overrides,
  };
}

export function stageRecord(
  stage: PipelineStage,
  decision: GateDecision | null,
  overrides: Partial<RunReport> = {},
): StageRecord {
  return { stage, report: stageReport(stage, overrides), decision };
}

export function pipelineReport(
  outcome: PipelineOutcome,
  stages: readonly StageRecord[],
  haltedAt: PipelineStage | null = null,
): PipelineReport {
  return {
    runId: 'run-pipeline',
    team: 'feature-team',
    task: 'build the widget',
    outcome,
    stages,
    haltedAt,
  };
}
