import type { PipelineReport } from './pipeline-report';
import type { StageRecord } from './stage-record';

export function renderPipelineReport(report: PipelineReport): string {
  const lines: string[] = [
    `omd team run — ${report.outcome}`,
    `team: ${report.team}`,
    `task: ${report.task}`,
  ];
  for (const record of report.stages) {
    lines.push(`  ${record.stage}: ${stageLine(record)}`);
  }
  if (report.haltedAt !== null) {
    lines.push(`halted at: ${report.haltedAt}`);
  }
  return lines.join('\n');
}

function stageLine(record: StageRecord): string {
  const status: string =
    record.report.failureTier === null
      ? 'ok'
      : `failed (${record.report.failureTier})`;
  return `${status}, gate=${record.decision ?? '(none)'}`;
}
