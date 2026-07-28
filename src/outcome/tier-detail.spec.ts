import { describe, expect, it } from 'vitest';
import type { RunReport } from './run-report';
import { tierDetail } from './tier-detail';

function report(overrides: Partial<RunReport>): RunReport {
  return {
    runId: 'run-1',
    role: 'reviewer',
    task: 'assess',
    engine: 'devin-headless',
    sessionId: 's-1',
    failureTier: null,
    turnsUsed: 2,
    maxTurns: 6,
    wallTimeMs: 1200,
    artifactPath: 'review.json',
    writeScope: 'artifact',
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
    ...overrides,
  };
}

describe('tierDetail', () => {
  it('reports a success', () => {
    expect(tierDetail(report({}))).toBe('outcome: success');
  });

  it('names the matched deny rule of a tier 1 failure', () => {
    expect(
      tierDetail(report({ failureTier: 'deny', denyRule: 'Write(/etc)' })),
    ).toContain('matched deny rule Write(/etc)');
  });

  it('reports an unknown deny rule when none was captured', () => {
    expect(tierDetail(report({ failureTier: 'deny' }))).toContain('(unknown)');
  });

  it('lists the validation errors of a tier 2 failure', () => {
    expect(
      tierDetail(
        report({
          failureTier: 'invalid_artifact',
          validationErrors: ['missing verdict'],
        }),
      ),
    ).toContain('  - missing verdict');
  });

  it('reports a missing artifact when a tier 2 failure carries no errors', () => {
    expect(tierDetail(report({ failureTier: 'invalid_artifact' }))).toContain(
      '(artifact missing)',
    );
  });

  it('reports the budget consumed by a tier 3 failure', () => {
    expect(tierDetail(report({ failureTier: 'budget' }))).toContain(
      'used 2/6 turns over 1200ms',
    );
  });
});
