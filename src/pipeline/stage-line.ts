import type { StageRecord } from './stage-record';

export function stageLine(record: StageRecord): string {
  const status: string =
    record.report.failureTier === null
      ? 'ok'
      : `failed (${record.report.failureTier})`;
  return `${status}, gate=${record.decision ?? '(none)'}`;
}
