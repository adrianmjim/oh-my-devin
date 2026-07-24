import { exitCodeForOutcome } from './exit-code-for-outcome';
import type { JsonRunReport } from './json-run-report';
import type { RunOutcome } from './run-outcome';
import type { RunReport } from './run-report';

export function renderJsonReport(report: RunReport): JsonRunReport {
  const outcome: RunOutcome =
    report.failureTier === null ? 'success' : 'failure';
  return {
    runId: report.runId,
    role: report.role,
    task: report.task,
    engine: report.engine,
    sessionId: report.sessionId,
    outcome,
    failureTier: report.failureTier,
    exitCode: exitCodeForOutcome(report.failureTier),
    turnsUsed: report.turnsUsed,
    maxTurns: report.maxTurns,
    wallTimeMs: report.wallTimeMs,
    artifactPath: report.artifactPath,
    artifactValid: report.artifactValid,
    validationErrors: report.validationErrors,
    denyRule: report.denyRule,
    repairAttempted: report.repairAttempted,
  };
}
