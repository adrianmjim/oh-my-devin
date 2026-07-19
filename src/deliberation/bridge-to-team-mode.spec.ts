import { describe, expect, it } from 'vitest';
import type { PipelineReport } from '../pipeline/pipeline-report';
import type { TeamDefinition } from '../team/team-definition';
import type { AuthorityPolicy } from '../council/authority-policy';
import type { BridgeInput } from './bridge-input';
import type { BridgeResult } from './bridge-result';
import type { ClosureState } from './closure-state';
import type { DecisionRecord } from './decision-record';
import type { LaunchRequest } from './pipeline-launcher';
import { bridgeToTeamMode } from './bridge-to-team-mode';

const TEAM: TeamDefinition = {
  name: 'feature-team',
  members: [{ role: 'architect', count: 1, strategy: null }],
  workflow: [{ from: 'architect', then: 'done', outcomes: [] }],
};

function record(
  closure: ClosureState,
  authority: AuthorityPolicy,
): DecisionRecord {
  return {
    question: 'service-decomposition',
    proposal: 'modular-monolith',
    proposalSource: 'attached',
    consent: closure,
    authorityApplied: authority,
    supportingArguments: [],
    objections: [],
    assumptions: [],
    reconsiderWhen: [],
    humanDecisionRequired: closure !== 'passed' || authority === 'human',
  };
}

interface Harness {
  readonly requests: LaunchRequest[];
  readonly input: (overrides: Partial<BridgeInput>) => BridgeInput;
}

function harness(): Harness {
  const requests: LaunchRequest[] = [];
  const pipeline: PipelineReport = {
    team: 'feature-team',
    task: 'modular-monolith',
    outcome: 'succeeded',
    stages: [],
    haltedAt: null,
  };
  return {
    requests,
    input: (overrides: Partial<BridgeInput>): BridgeInput => ({
      record: record('passed', 'proceed'),
      team: TEAM,
      humanSigned: false,
      launch: (request: LaunchRequest): Promise<PipelineReport> => {
        requests.push(request);
        return Promise.resolve(pipeline);
      },
      ...overrides,
    }),
  };
}

describe('bridgeToTeamMode', () => {
  it('launches the team pipeline on an authorized proceed close', async () => {
    const h: Harness = harness();
    const result: BridgeResult = await bridgeToTeamMode(h.input({}));

    expect(result.launched).toBe(true);
    expect(result.pipeline?.outcome).toBe('succeeded');
    expect(h.requests[0]?.proposal).toBe('modular-monolith');
    expect(h.requests[0]?.team.name).toBe('feature-team');
  });

  it('launches once the human signs a passed-under-human close', async () => {
    const h: Harness = harness();
    const result: BridgeResult = await bridgeToTeamMode(
      h.input({ record: record('passed', 'human'), humanSigned: true }),
    );
    expect(result.launched).toBe(true);
  });

  it('does not launch a passed-under-human close awaiting signature', async () => {
    const h: Harness = harness();
    const result: BridgeResult = await bridgeToTeamMode(
      h.input({ record: record('passed', 'human'), humanSigned: false }),
    );
    expect(result.launched).toBe(false);
    expect(h.requests).toHaveLength(0);
  });

  it('does not launch a blocked close', async () => {
    const h: Harness = harness();
    const result: BridgeResult = await bridgeToTeamMode(
      h.input({ record: record('blocked', 'proceed') }),
    );
    expect(result.launched).toBe(false);
  });

  it('does not launch when no team is designated', async () => {
    const h: Harness = harness();
    const result: BridgeResult = await bridgeToTeamMode(
      h.input({ team: null }),
    );
    expect(result.launched).toBe(false);
    expect(h.requests).toHaveLength(0);
  });
});
