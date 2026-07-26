import { describe, expect, it } from 'vitest';
import { stageReportFixture } from './stage-report-fixture';

describe('stageReportFixture', () => {
  it('builds a passing report for the stage', () => {
    const report = stageReportFixture('reviewer', {});

    expect(report.role).toBe('reviewer');
    expect(report.artifactPath).toBe('reviewer.json');
    expect(report.failureTier).toBeNull();
    expect(report.artifactValid).toBe(true);
  });

  it('applies the overrides it is given', () => {
    expect(
      stageReportFixture('executor', { failureTier: 'deny' }).failureTier,
    ).toBe('deny');
  });
});
