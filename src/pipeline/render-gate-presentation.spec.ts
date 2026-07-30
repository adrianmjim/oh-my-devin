import { describe, expect, it } from 'vitest';
import type { RunReport } from '../outcome/run-report';
import type { GatePresentation } from './gate-presentation';
import { renderGatePresentation } from './render-gate-presentation';

function presentation(overrides: Partial<RunReport>): GatePresentation {
  return {
    stage: 'reviewer',
    report: {
      runId: 'run-1',
      role: 'reviewer',
      task: 't',
      engine: 'devin-headless',
      sessionId: 's-1',
      failureTier: null,
      turnsUsed: 1,
      maxTurns: 6,
      wallTimeMs: 0,
      artifactPath: 'review.json',
      writeScope: 'artifact',
      artifactValid: true,
      validationErrors: [],
      denyRule: null,
      repairAttempted: false,
      ...overrides,
    },
  };
}

describe('renderGatePresentation', () => {
  it('reports a succeeded stage', () => {
    expect(renderGatePresentation(presentation({}))).toContain(
      'Stage "reviewer" succeeded.',
    );
  });

  it('names the failure tier of a failed stage', () => {
    expect(
      renderGatePresentation(presentation({ failureTier: 'budget' })),
    ).toContain('Stage "reviewer" failed (budget).');
  });

  it('states the artifact and its validity', () => {
    expect(renderGatePresentation(presentation({}))).toContain(
      'artifact: review.json (valid: true)',
    );
  });

  it('reports a missing session as none', () => {
    expect(renderGatePresentation(presentation({ sessionId: null }))).toContain(
      'session: (none)',
    );
  });

  it('closes by asking for the decision', () => {
    expect(
      renderGatePresentation(presentation({})).endsWith(
        'Approve this stage? [approve/reject]',
      ),
    ).toBe(true);
  });
});
