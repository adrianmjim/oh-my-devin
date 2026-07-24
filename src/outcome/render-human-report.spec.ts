import { describe, expect, it } from 'vitest';
import type { RunReport } from './run-report';
import { renderHumanReport } from './render-human-report';

function report(overrides: Partial<RunReport>): RunReport {
  return {
    runId: 'run-human',
    role: 'reviewer',
    task: 'assess the diff',
    engine: 'devin',
    sessionId: 's1',
    failureTier: null,
    turnsUsed: 2,
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

describe('renderHumanReport', () => {
  it('names the role, task, engine, artifact path, session id, and turns used', () => {
    const text: string = renderHumanReport(report({}));
    expect(text).toContain('run-human');
    expect(text).toContain('reviewer');
    expect(text).toContain('assess the diff');
    expect(text).toContain('devin');
    expect(text).toContain('review.json');
    expect(text).toContain('s1');
    expect(text).toContain('2/8');
  });

  it('states the deny rule for a tier-1 failure', () => {
    const text: string = renderHumanReport(
      report({
        failureTier: 'deny',
        artifactValid: false,
        denyRule: 'Bash(rm*)',
      }),
    );
    expect(text.toLowerCase()).toContain('deny');
    expect(text).toContain('Bash(rm*)');
  });

  it('lists the validation errors for a tier-2 failure', () => {
    const text: string = renderHumanReport(
      report({
        failureTier: 'invalid_artifact',
        artifactValid: false,
        validationErrors: ['(root) must have required property verdict'],
        repairAttempted: true,
      }),
    );
    expect(text).toContain('must have required property verdict');
  });

  it('states the turns and wall time for a tier-3 failure', () => {
    const text: string = renderHumanReport(
      report({ failureTier: 'budget', artifactValid: false }),
    );
    expect(text.toLowerCase()).toContain('budget');
    expect(text).toContain('1200');
  });
});
