import { describe, expect, it } from 'vitest';
import type { JsonPipelineReport } from './json-pipeline-report';
import { pipelineReport, stageRecord } from './pipeline-report-fixture';
import { renderPipelineReportJson } from './render-pipeline-report-json';

describe('renderPipelineReportJson', () => {
  it('projects the report with an exit code and per-stage records', () => {
    const json: JsonPipelineReport = renderPipelineReportJson(
      pipelineReport('succeeded', [
        stageRecord('architect', 'approve'),
        stageRecord('executor', 'approve'),
        stageRecord('reviewer', 'approve'),
      ]),
    );

    expect(json.team).toBe('feature-team');
    expect(json.outcome).toBe('succeeded');
    expect(json.exitCode).toBe(0);
    expect(json.stages).toHaveLength(3);
    expect(json.stages[0]?.stage).toBe('architect');
    expect(json.stages[0]?.decision).toBe('approve');
  });

  it('carries the halting stage and a non-zero exit code', () => {
    const json: JsonPipelineReport = renderPipelineReportJson(
      pipelineReport(
        'halted',
        [
          stageRecord('executor', null, {
            failureTier: 'deny',
            artifactValid: false,
          }),
        ],
        'executor',
      ),
    );

    expect(json.haltedAt).toBe('executor');
    expect(json.exitCode).not.toBe(0);
    expect(json.stages[0]?.failureTier).toBe('deny');
  });
});
