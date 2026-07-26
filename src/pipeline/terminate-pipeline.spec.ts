import { describe, expect, it } from 'vitest';
import type { PipelineReport } from './pipeline-report';
import type { RunPipelineOptions } from './run-pipeline-options';
import { stageRecordFixture } from './stage-record-fixture';
import { terminatePipeline } from './terminate-pipeline';

const OPTIONS: RunPipelineOptions = {
  team: { name: 'feature-team', members: [], workflow: [] },
  task: 'build the widget',
  runStage: () => Promise.reject(new Error('unused')),
  gate: () => Promise.resolve('none'),
};

describe('terminatePipeline', () => {
  it('reports the run identity, team, and task', () => {
    const report: PipelineReport = terminatePipeline(
      OPTIONS,
      'run-1',
      [],
      'succeeded',
      null,
    );

    expect(report.runId).toBe('run-1');
    expect(report.team).toBe('feature-team');
    expect(report.task).toBe('build the widget');
    expect(report.outcome).toBe('succeeded');
    expect(report.haltedAt).toBeNull();
  });

  it('carries the stage records and the halt point', () => {
    const records = [stageRecordFixture('reviewer', null)];

    const report: PipelineReport = terminatePipeline(
      OPTIONS,
      'run-1',
      records,
      'halted',
      'reviewer',
    );

    expect(report.stages).toBe(records);
    expect(report.haltedAt).toBe('reviewer');
  });
});
