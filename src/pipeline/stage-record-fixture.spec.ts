import { describe, expect, it } from 'vitest';
import { stageRecordFixture } from './stage-record-fixture';

describe('stageRecordFixture', () => {
  it('pairs the stage with its report and gate decision', () => {
    const record = stageRecordFixture('reviewer', 'approve');

    expect(record.stage).toBe('reviewer');
    expect(record.decision).toBe('approve');
    expect(record.report.role).toBe('reviewer');
  });

  it('passes the report overrides through', () => {
    expect(
      stageRecordFixture('executor', null, { turnsUsed: 4 }).report.turnsUsed,
    ).toBe(4);
  });
});
