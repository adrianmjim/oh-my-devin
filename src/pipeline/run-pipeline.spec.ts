import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import { parseTeamDefinition } from '../team/parse-team-definition';
import type { TeamDefinition } from '../team/team-definition';
import type { GateDecision } from './gate-decision';
import type { GatePresentation } from './gate-presentation';
import type { PipelineReport } from './pipeline-report';
import type { StageRequest } from './stage-request';
import type { StageResult } from './stage-result';
import { runPipeline } from './run-pipeline';

const KNOWN_ROLES: readonly string[] = ['architect', 'executor', 'reviewer'];

const TEAM_YAML: string = [
  'name: feature-team',
  'members:',
  '  - role: architect',
  '    count: 1',
  '  - role: executor',
  '    count: 1',
  '  - role: reviewer',
  '    count: 1',
  'workflow:',
  '  architect:',
  '    then: executor',
  '  executor:',
  '    then: reviewer',
  '  reviewer:',
  '    on_passed: done',
  '    on_blocked: executor',
].join('\n');

function team(): TeamDefinition {
  return parseTeamDefinition(TEAM_YAML, KNOWN_ROLES);
}

function report(
  stage: PipelineStage,
  overrides: Partial<RunReport>,
): RunReport {
  return {
    role: stage,
    task: 'build the widget',
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
    ...overrides,
  };
}

function defaultProduced(
  stage: PipelineStage,
): ReadonlyMap<HandoffArtifactName, string> {
  if (stage === 'architect') {
    return new Map<HandoffArtifactName, string>([
      ['architecture.json', 'ARCH'],
    ]);
  }
  if (stage === 'executor') {
    return new Map<HandoffArtifactName, string>([
      ['diff', 'DIFF'],
      ['evidence.json', 'EVID'],
    ]);
  }
  return new Map<HandoffArtifactName, string>([['review.json', 'REV']]);
}

interface StageScript {
  readonly report?: Partial<RunReport>;
  readonly produced?: ReadonlyMap<HandoffArtifactName, string>;
}

class RecordingStages {
  public readonly requests: StageRequest[] = [];
  private readonly queues: Map<PipelineStage, StageScript[]>;

  public constructor(scripts: Partial<Record<PipelineStage, StageScript[]>>) {
    this.queues = new Map<PipelineStage, StageScript[]>();
    for (const stage of KNOWN_ROLES as readonly PipelineStage[]) {
      this.queues.set(stage, [...(scripts[stage] ?? [])]);
    }
  }

  public readonly run = (request: StageRequest): Promise<StageResult> => {
    this.requests.push(request);
    const script: StageScript = this.queues.get(request.stage)?.shift() ?? {};
    return Promise.resolve({
      report: report(request.stage, script.report ?? {}),
      produced: script.produced ?? defaultProduced(request.stage),
    });
  };

  public count(stage: PipelineStage): number {
    return this.requests.filter(
      (request: StageRequest): boolean => request.stage === stage,
    ).length;
  }
}

class RecordingGate {
  public readonly presentations: GatePresentation[] = [];
  private readonly decisions: GateDecision[];

  public constructor(decisions: readonly GateDecision[]) {
    this.decisions = [...decisions];
  }

  public readonly decide = (
    presentation: GatePresentation,
  ): Promise<GateDecision> => {
    this.presentations.push(presentation);
    return Promise.resolve(this.decisions.shift() ?? 'none');
  };
}

describe('runPipeline', () => {
  it('runs the three stages in order and succeeds when every gate approves', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate(['approve', 'approve', 'approve']);

    const result: PipelineReport = await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    expect(stages.requests.map((r) => r.stage)).toEqual([
      'architect',
      'executor',
      'reviewer',
    ]);
    expect(result.outcome).toBe('succeeded');
    expect(result.haltedAt).toBeNull();
    expect(result.stages.map((s) => s.stage)).toEqual([
      'architect',
      'executor',
      'reviewer',
    ]);
  });

  it('applies the context policy at every stage boundary', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate(['approve', 'approve', 'approve']);

    await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    const [architect, executor, reviewer] = stages.requests;
    expect([...(architect?.inputs.keys() ?? [])]).toEqual(['requirements']);
    expect([...(executor?.inputs.keys() ?? [])]).toEqual([
      'requirements',
      'architecture.json',
    ]);
    expect([...(reviewer?.inputs.keys() ?? [])]).toEqual([
      'requirements',
      'diff',
      'evidence.json',
    ]);
    expect(reviewer?.inputs.has('architecture.json')).toBe(false);
  });

  it('seeds the requirements artifact from the task prompt', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate(['approve', 'approve', 'approve']);

    await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    expect(stages.requests[0]?.inputs.get('requirements')).toBe(
      'build the widget',
    );
  });

  it('includes an optional requirements.md alongside the prompt', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate(['approve', 'approve', 'approve']);

    await runPipeline({
      team: team(),
      task: 'build the widget',
      requirements: 'MUST be accessible',
      runStage: stages.run,
      gate: gate.decide,
    });

    const requirements: string =
      stages.requests[0]?.inputs.get('requirements') ?? '';
    expect(requirements).toContain('build the widget');
    expect(requirements).toContain('MUST be accessible');
  });

  it('routes a reviewer rejection back to the executor as a fresh run', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate([
      'approve',
      'approve',
      'reject',
      'approve',
      'approve',
    ]);

    const result: PipelineReport = await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    expect(stages.requests.map((r) => r.stage)).toEqual([
      'architect',
      'executor',
      'reviewer',
      'executor',
      'reviewer',
    ]);
    expect(stages.count('executor')).toBe(2);
    expect(result.outcome).toBe('succeeded');
  });

  it('halts when a rejected stage has no declared successor', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate(['reject']);

    const result: PipelineReport = await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    expect(result.outcome).toBe('halted');
    expect(result.haltedAt).toBe('architect');
    expect(stages.count('executor')).toBe(0);
  });

  it('does not advance on a malformed or absent decision', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate(['none']);

    const result: PipelineReport = await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    expect(result.outcome).toBe('halted');
    expect(result.haltedAt).toBe('architect');
    expect(stages.count('executor')).toBe(0);
  });

  it('succeeds at the terminal reviewer gate on approval', async () => {
    const stages = new RecordingStages({});
    const gate = new RecordingGate(['approve', 'approve', 'approve']);

    const result: PipelineReport = await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    const reviewer = result.stages.find((s) => s.stage === 'reviewer');
    expect(reviewer?.decision).toBe('approve');
    expect(result.outcome).toBe('succeeded');
  });

  it('halts on a stage failure without presenting a gate or starting the next stage', async () => {
    const stages = new RecordingStages({
      architect: [
        { report: { failureTier: 'invalid_artifact', artifactValid: false } },
      ],
    });
    const gate = new RecordingGate([]);

    const result: PipelineReport = await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    expect(result.outcome).toBe('halted');
    expect(result.haltedAt).toBe('architect');
    expect(gate.presentations).toHaveLength(0);
    expect(stages.count('executor')).toBe(0);
    expect(result.stages[0]?.decision).toBeNull();
  });

  it('does not auto-retry a failed stage', async () => {
    const stages = new RecordingStages({
      executor: [{ report: { failureTier: 'deny', artifactValid: false } }],
    });
    const gate = new RecordingGate(['approve']);

    await runPipeline({
      team: team(),
      task: 'build the widget',
      runStage: stages.run,
      gate: gate.decide,
    });

    expect(stages.count('executor')).toBe(1);
  });
});
