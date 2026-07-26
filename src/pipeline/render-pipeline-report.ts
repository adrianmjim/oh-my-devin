import type { PipelineReport } from './pipeline-report';
import { stageLine } from './stage-line';

export function renderPipelineReport(report: PipelineReport): string {
  const lines: string[] = [
    `omd team run — ${report.outcome}`,
    `run:  ${report.runId}`,
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
