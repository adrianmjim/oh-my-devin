import { createInterface } from 'node:readline';
import { PassThrough } from 'node:stream';
import { describe, expect, it } from 'vitest';
import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import { createStdinGate } from './create-stdin-gate';
import type { GateDecision } from './gate-decision';
import type { GatePresentation } from './gate-presentation';
import type { PipelineGate } from './pipeline-gate';

function presentation(stage: PipelineStage): GatePresentation {
  const report: RunReport = {
    runId: `run-${stage}`,
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

interface GateHarness {
  readonly gate: PipelineGate;
  readonly input: PassThrough;
  readonly captured: string[];
}

function harness(): GateHarness {
  const input = new PassThrough();
  const captured: string[] = [];
  const gate = createStdinGate(createInterface({ input }), (text: string) => {
    captured.push(text);
  });
  return { gate, input, captured };
}

function flush(): Promise<void> {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
}

describe('createStdinGate', () => {
  it('maps approve words to approve', async () => {
    for (const word of ['approve', 'Approve', ' a ', 'y', 'yes']) {
      const { gate, input } = harness();
      const pending = gate(presentation('reviewer'));
      input.write(`${word}\n`);
      expect(await pending).toBe('approve');
    }
  });

  it('maps reject words to reject', async () => {
    for (const word of ['reject', 'REJECT', ' r ', 'n', 'no']) {
      const { gate, input } = harness();
      const pending = gate(presentation('reviewer'));
      input.write(`${word}\n`);
      expect(await pending).toBe('reject');
    }
  });

  it('maps an unrecognized answer to none', async () => {
    const { gate, input } = harness();
    const pending = gate(presentation('reviewer'));
    input.write('maybe\n');
    expect(await pending).toBe('none');
  });

  it('buffers lines arriving before a gate attaches and hands them to the next gates', async () => {
    const { gate, input } = harness();
    input.write('approve\nreject\n');
    await flush();

    const first: GateDecision = await gate(presentation('architect'));
    const second: GateDecision = await gate(presentation('executor'));

    expect(first).toBe('approve');
    expect(second).toBe('reject');
  });

  it('resolves a pending gate as none on stdin EOF', async () => {
    const { gate, input } = harness();
    const pending = gate(presentation('architect'));
    input.end();

    expect(await pending).toBe('none');
  });

  it('resolves every gate after EOF as none', async () => {
    const { gate, input } = harness();
    input.end();
    await flush();

    expect(await gate(presentation('architect'))).toBe('none');
    expect(await gate(presentation('executor'))).toBe('none');
  });

  it('consumes buffered lines before resolving as none at EOF', async () => {
    const { gate, input } = harness();
    input.write('approve\n');
    input.end();
    await flush();

    expect(await gate(presentation('architect'))).toBe('approve');
    expect(await gate(presentation('executor'))).toBe('none');
  });

  it('presents the stage and its outcome before reading a decision', async () => {
    const { gate, input, captured } = harness();
    const pending = gate(presentation('executor'));
    input.write('approve\n');
    await pending;

    expect(captured.join('\n')).toContain('executor');
  });
});
