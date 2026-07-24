import { describe, expect, it } from 'vitest';
import type { HandoffArtifactName } from '../handoff/handoff-artifact-name';
import type { PipelineStage } from '../handoff/pipeline-stage';
import type { GateDecision } from '../pipeline/gate-decision';
import type { PipelineReport } from '../pipeline/pipeline-report';
import type { StageRequest } from '../pipeline/stage-request';
import type { StageResult } from '../pipeline/stage-result';
import { parseTeamDefinition } from '../team/parse-team-definition';
import type { TeamDefinition } from '../team/team-definition';
import { createPipelineLauncher } from './create-pipeline-launcher';
import type { PipelineLauncher } from './pipeline-launcher';

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
].join('\n');

function producedFor(
  stage: PipelineStage,
): ReadonlyMap<HandoffArtifactName, string> {
  if (stage === 'architect') {
    return new Map<HandoffArtifactName, string>([['architecture.json', 'A']]);
  }
  if (stage === 'executor') {
    return new Map<HandoffArtifactName, string>([
      ['diff', 'D'],
      ['evidence.json', 'E'],
    ]);
  }
  return new Map<HandoffArtifactName, string>([['review.json', 'R']]);
}

describe('createPipelineLauncher', () => {
  it('launches the designated team with the proposal carried as requirements', async () => {
    const team: TeamDefinition = parseTeamDefinition(TEAM_YAML, KNOWN_ROLES);
    const requests: StageRequest[] = [];
    const launch: PipelineLauncher = createPipelineLauncher({
      runStage: (request: StageRequest): Promise<StageResult> => {
        requests.push(request);
        return Promise.resolve({
          report: {
            runId: `run-${request.stage}`,
            role: request.stage,
            task: 't',
            engine: 'devin-headless',
            sessionId: 's',
            failureTier: null,
            turnsUsed: 1,
            maxTurns: 8,
            wallTimeMs: 0,
            artifactPath: `${request.stage}.json`,
            artifactValid: true,
            validationErrors: [],
            denyRule: null,
            repairAttempted: false,
          },
          produced: producedFor(request.stage),
        });
      },
      gate: (): Promise<GateDecision> => Promise.resolve('approve'),
    });

    const report: PipelineReport = await launch({
      team,
      question: 'ship the decided plan',
      proposal: 'the decided proposal',
    });

    expect(report.team).toBe('feature-team');
    expect(report.outcome).toBe('succeeded');
    const requirements: string = requests[0]?.inputs.get('requirements') ?? '';
    expect(requirements).toContain('ship the decided plan');
    expect(requirements).toContain('the decided proposal');
  });
});
