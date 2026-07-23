import { describe, expect, it } from 'vitest';
import { pipelineReport, stageRecord } from './pipeline-report-fixture';
import { renderPipelineReport } from './render-pipeline-report';

describe('renderPipelineReport', () => {
  it('summarizes a successful pipeline stage by stage', () => {
    const text: string = renderPipelineReport(
      pipelineReport('succeeded', [
        stageRecord('architect', 'approve'),
        stageRecord('executor', 'approve'),
        stageRecord('reviewer', 'approve'),
      ]),
    );

    expect(text).toContain('run-pipeline');
    expect(text).toContain('feature-team');
    expect(text).toContain('succeeded');
    expect(text).toContain('architect');
    expect(text).toContain('reviewer');
  });

  it('names the halting stage when the pipeline halts', () => {
    const text: string = renderPipelineReport(
      pipelineReport(
        'halted',
        [
          stageRecord('architect', 'approve'),
          stageRecord('executor', null, {
            failureTier: 'invalid_artifact',
            artifactValid: false,
          }),
        ],
        'executor',
      ),
    );

    expect(text).toContain('halted');
    expect(text).toContain('executor');
  });
});
