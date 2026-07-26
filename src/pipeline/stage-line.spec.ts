import { describe, expect, it } from 'vitest';
import { stageLine } from './stage-line';
import { stageRecordFixture } from './stage-record-fixture';

describe('stageLine', () => {
  it('reports an approved stage as ok', () => {
    expect(stageLine(stageRecordFixture('reviewer', 'approve'))).toBe(
      'ok, gate=approve',
    );
  });

  it('names the failure tier of a failed stage', () => {
    expect(
      stageLine(stageRecordFixture('reviewer', null, { failureTier: 'deny' })),
    ).toBe('failed (deny), gate=(none)');
  });
});
