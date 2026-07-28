import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';
import type { RunReport } from '../outcome/run-report';
import { parseTeamDefinition } from '../team/parse-team-definition';
import type { TeamDefinition } from '../team/team-definition';
import { composeStagePrompt } from './compose-stage-prompt';
import type { GateDecision } from './gate-decision';
import { runPipeline } from './run-pipeline';
import type { StageRequest } from './stage-request';
import type { StageResult } from './stage-result';

const KNOWN_ROLES: readonly string[] = ['architect', 'executor', 'reviewer'];

const REWORK_TEAM: string = [
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

const UNDESIGNATED_REWORK_TEAM: string = [
  'name: no-reviewer',
  'members:',
  '  - role: architect',
  '    count: 1',
  '  - role: executor',
  '    count: 1',
  'workflow:',
  '  architect:',
  '    then: executor',
  '  executor:',
  '    on_passed: done',
  '    on_blocked: executor',
].join('\n');

const FIRST_FINDINGS: string = JSON.stringify({
  verdict: 'request_changes',
  findings: [
    {
      severity: 'high',
      location: 'src/widget.ts:42',
      summary: 'the retry loop never terminates',
      fix: 'bound the loop by the declared attempt ceiling',
    },
  ],
});

const SECOND_FINDINGS: string = JSON.stringify({
  verdict: 'request_changes',
  findings: [
    {
      severity: 'medium',
      location: 'src/widget.ts:17',
      summary: 'the bound is off by one',
      fix: 'compare with less-than, not less-than-or-equal',
    },
  ],
});

function report(stage: PipelineStage): RunReport {
  return {
    runId: `run-${stage}`,
    role: stage,
    task: 'build the widget',
    engine: 'devin-headless',
    sessionId: `s-${stage}`,
    failureTier: null,
    turnsUsed: 1,
    maxTurns: 8,
    wallTimeMs: 0,
    artifactPath: `${stage}.json`,
    writeScope: 'artifact',
    artifactValid: true,
    validationErrors: [],
    denyRule: null,
    repairAttempted: false,
  };
}

class ScriptedPipeline {
  public readonly requests: StageRequest[] = [];
  private readonly reviews: string[];
  private readonly decisions: GateDecision[];

  public constructor(
    reviews: readonly string[],
    decisions: readonly GateDecision[],
  ) {
    this.reviews = [...reviews];
    this.decisions = [...decisions];
  }

  public readonly run = (request: StageRequest): Promise<StageResult> => {
    this.requests.push(request);
    return Promise.resolve({
      report: report(request.stage),
      produced: this.produce(request.stage),
    });
  };

  public readonly decide = (): Promise<GateDecision> =>
    Promise.resolve(this.decisions.shift() ?? 'none');

  public promptsFor(stage: PipelineStage): readonly string[] {
    return this.requests
      .filter((request: StageRequest): boolean => request.stage === stage)
      .map(composeStagePrompt);
  }

  private produce(
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
    return new Map<HandoffArtifactName, string>([
      ['review.json', this.reviews.shift() ?? FIRST_FINDINGS],
    ]);
  }
}

function team(yaml: string): TeamDefinition {
  return parseTeamDefinition(yaml, KNOWN_ROLES);
}

describe('a rejected review re-enters the executor with its findings', () => {
  it("puts the rejecting review.json's findings in the re-entered executor prompt", async () => {
    const pipeline = new ScriptedPipeline(
      [FIRST_FINDINGS],
      ['approve', 'approve', 'reject', 'approve', 'approve'],
    );

    await runPipeline({
      team: team(REWORK_TEAM),
      task: 'build the widget',
      runStage: pipeline.run,
      gate: pipeline.decide,
    });

    const prompts: readonly string[] = pipeline.promptsFor('executor');
    expect(prompts).toHaveLength(2);
    const rework: string = prompts[1] ?? '';
    expect(rework).toContain('the retry loop never terminates');
    expect(rework).toContain('bound the loop by the declared attempt ceiling');
    expect(rework).toContain('src/widget.ts:42');
    expect(rework).toContain('DIFF');
    expect(rework).toMatch(/rejected/);
  });

  it('leaves the first executor prompt free of any review', async () => {
    const pipeline = new ScriptedPipeline(
      [FIRST_FINDINGS],
      ['approve', 'approve', 'reject', 'approve', 'approve'],
    );

    await runPipeline({
      team: team(REWORK_TEAM),
      task: 'build the widget',
      runStage: pipeline.run,
      gate: pipeline.decide,
    });

    const first: string = pipeline.promptsFor('executor')[0] ?? '';
    expect(first).not.toContain('review.json');
    expect(first).not.toContain('the retry loop never terminates');
    expect(first).not.toMatch(/rejected/);
  });

  it('conveys the second round findings, not the first', async () => {
    const pipeline = new ScriptedPipeline(
      [FIRST_FINDINGS, SECOND_FINDINGS],
      [
        'approve',
        'approve',
        'reject',
        'approve',
        'reject',
        'approve',
        'approve',
      ],
    );

    await runPipeline({
      team: team(REWORK_TEAM),
      task: 'build the widget',
      runStage: pipeline.run,
      gate: pipeline.decide,
    });

    const prompts: readonly string[] = pipeline.promptsFor('executor');
    expect(prompts).toHaveLength(3);

    const firstRework: string = prompts[1] ?? '';
    expect(firstRework).toContain('the retry loop never terminates');
    expect(firstRework).not.toContain('the bound is off by one');

    const secondRework: string = prompts[2] ?? '';
    expect(secondRework).toContain('the bound is off by one');
    expect(secondRework).not.toContain('the retry loop never terminates');
  });

  it('composes the base inputs when a stage other than the reviewer re-enters the executor', async () => {
    const pipeline = new ScriptedPipeline([], ['approve', 'reject', 'approve']);

    const run = runPipeline({
      team: team(UNDESIGNATED_REWORK_TEAM),
      task: 'build the widget',
      runStage: pipeline.run,
      gate: pipeline.decide,
    });

    await expect(run).resolves.toBeDefined();

    const executorRequests: readonly StageRequest[] = pipeline.requests.filter(
      (request: StageRequest): boolean => request.stage === 'executor',
    );
    expect(executorRequests).toHaveLength(2);

    const reentered: StageRequest | undefined = executorRequests[1];
    expect(reentered?.reworkFrom).toBe('executor');
    expect([...(reentered?.inputs.keys() ?? [])]).toEqual([
      'requirements',
      'architecture.json',
    ]);

    const prompt: string = pipeline.promptsFor('executor')[1] ?? '';
    expect(prompt).not.toContain('## review.json');
  });
});
