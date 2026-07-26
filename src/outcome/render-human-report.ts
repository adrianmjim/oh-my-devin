import type { RunReport } from './run-report';
import { tierDetail } from './tier-detail';

export function renderHumanReport(report: RunReport): string {
  const outcome: string = report.failureTier === null ? 'success' : 'failure';
  return [
    `omd run — ${outcome}`,
    `run:      ${report.runId}`,
    `role:     ${report.role}`,
    `task:     ${report.task}`,
    `engine:   ${report.engine}`,
    `session:  ${report.sessionId ?? '(none)'}`,
    `artifact: ${report.artifactPath} (${report.artifactValid ? 'valid' : 'invalid'})`,
    `turns:    ${report.turnsUsed}/${report.maxTurns}`,
    `walltime: ${report.wallTimeMs ?? 0}ms`,
    tierDetail(report),
  ].join('\n');
}
