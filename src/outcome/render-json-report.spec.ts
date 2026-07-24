import { describe, expect, it } from 'vitest';
import type { JsonRunReport } from './json-run-report';
import type { RunReport } from './run-report';
import { renderJsonReport } from './render-json-report';

function report(overrides: Partial<RunReport>): RunReport {
  return {
    runId: 'run-json',
    role: 'reviewer',
    task: 'assess the diff',
    engine: 'devin',
    sessionId: 's1',
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 8,
    wallTimeMs: 1200,
    artifactPath: 'review.json',
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
    ...overrides,
  };
}

const FIXED_FIELDS: readonly string[] = [
  'artifactPath',
  'artifactValid',
  'denyRule',
  'engine',
  'exitCode',
  'failureTier',
  'maxTurns',
  'outcome',
  'repairAttempted',
  'role',
  'runId',
  'sessionId',
  'task',
  'turnsUsed',
  'validationErrors',
  'wallTimeMs',
];

describe('renderJsonReport', () => {
  it('emits exactly the fixed field set', () => {
    const json: JsonRunReport = renderJsonReport(report({}));
    expect(Object.keys(json).sort()).toEqual([...FIXED_FIELDS].sort());
  });

  it('carries the run identity through the machine-readable report', () => {
    const json: JsonRunReport = renderJsonReport(report({}));
    expect(json.runId).toBe('run-json');
  });

  it('reports success with exit code 0', () => {
    const json: JsonRunReport = renderJsonReport(report({}));
    expect(json.outcome).toBe('success');
    expect(json.failureTier).toBeNull();
    expect(json.exitCode).toBe(0);
  });

  it('reports a deny failure with tier and exit code 2', () => {
    const json: JsonRunReport = renderJsonReport(
      report({
        failureTier: 'deny',
        artifactValid: false,
        denyRule: 'Bash(rm*)',
      }),
    );
    expect(json.outcome).toBe('failure');
    expect(json.failureTier).toBe('deny');
    expect(json.exitCode).toBe(2);
    expect(json.denyRule).toBe('Bash(rm*)');
  });

  it('carries validation errors for a tier-2 failure', () => {
    const json: JsonRunReport = renderJsonReport(
      report({
        failureTier: 'invalid_artifact',
        artifactValid: false,
        validationErrors: ['(root) must have required property verdict'],
        repairAttempted: true,
      }),
    );
    expect(json.exitCode).toBe(3);
    expect(json.validationErrors).toEqual([
      '(root) must have required property verdict',
    ]);
  });
});
