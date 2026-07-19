import type { RunReport } from './run-report';

function tierDetail(report: RunReport): string {
  switch (report.failureTier) {
    case null:
      return 'outcome: success';
    case 'deny':
      return `failure: tier 1 (deny hit) — matched deny rule ${report.denyRule ?? '(unknown)'}`;
    case 'invalid_artifact': {
      const errors: string =
        report.validationErrors.length === 0
          ? '  (artifact missing)'
          : report.validationErrors
              .map((error: string): string => `  - ${error}`)
              .join('\n');
      return `failure: tier 2 (invalid artifact)\n${errors}`;
    }
    case 'budget':
      return `failure: tier 3 (budget exhaustion) — used ${report.turnsUsed}/${report.maxTurns} turns over ${report.wallTimeMs ?? 0}ms`;
  }
}

export function renderHumanReport(report: RunReport): string {
  const outcome: string = report.failureTier === null ? 'success' : 'failure';
  return [
    `omd run — ${outcome}`,
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
