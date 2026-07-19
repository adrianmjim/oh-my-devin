import { describe, expect, it } from 'vitest';
import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import { createStdinGate } from './create-stdin-gate';
import type { GateDecision } from './gate-decision';
import type { GatePresentation } from './gate-presentation';
import type { PipelineGate } from './pipeline-gate';

function presentation(stage: PipelineStage): GatePresentation {
  const report: RunReport = {
    role: stage,
    task: 't',
    engine: 'devin-headless',
    sessionId: `s-${stage}`,
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 8,
    wallTimeMs: 0,
    artifactPath: `${stage}.json`,
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
  };
  return { stage, report };
}

function gateReturning(line: string, captured: string[] = []): PipelineGate {
  return createStdinGate(
    (): Promise<string> => Promise.resolve(line),
    (text: string): void => {
      captured.push(text);
    },
  );
}

describe('createStdinGate', () => {
  it('maps approve words to approve', async () => {
    for (const word of ['approve', 'Approve', ' a ', 'y', 'yes']) {
      const decision: GateDecision = await gateReturning(word)(
        presentation('reviewer'),
      );
      expect(decision).toBe('approve');
    }
  });

  it('maps reject words to reject', async () => {
    for (const word of ['reject', 'REJECT', ' r ', 'n', 'no']) {
      const decision: GateDecision = await gateReturning(word)(
        presentation('reviewer'),
      );
      expect(decision).toBe('reject');
    }
  });

  it('maps an unrecognized answer to none', async () => {
    const decision: GateDecision = await gateReturning('maybe')(
      presentation('reviewer'),
    );
    expect(decision).toBe('none');
  });

  it('presents the stage and its outcome before reading a decision', async () => {
    const captured: string[] = [];
    const gate: PipelineGate = gateReturning('approve', captured);
    await gate(presentation('executor'));
    expect(captured.join('\n')).toContain('executor');
  });
});
