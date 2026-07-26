import { describe, expect, it } from 'vitest';
import { pipelineReportFixture } from './pipeline-report-fixture';
import { stageRecordFixture } from './stage-record-fixture';

describe('pipelineReportFixture', () => {
  it('builds a report carrying the outcome and stages it is given', () => {
    const records = [stageRecordFixture('reviewer', 'approve')];

    const report = pipelineReportFixture('succeeded', records);

    expect(report.outcome).toBe('succeeded');
    expect(report.stages).toBe(records);
    expect(report.haltedAt).toBeNull();
  });

  it('carries the halt point when the pipeline halted', () => {
    expect(pipelineReportFixture('halted', [], 'executor').haltedAt).toBe(
      'executor',
    );
  });
});
