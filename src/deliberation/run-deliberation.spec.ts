import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import type { AuthorityPolicy } from '../council/authority-policy';
import type { PipelineReport } from '../pipeline/pipeline-report';
import type { TeamDefinition } from '../team/team-definition';
import type { DeliberationInput } from './deliberation-input';
import type { DeliberationOutcome } from './deliberation-outcome';
import type { LaunchRequest } from './pipeline-launcher';
import type { SeatInvocation } from './seat-invocation';
import type { TypedPosition } from './typed-position';
import { runDeliberation } from './run-deliberation';

const TEAM: TeamDefinition = {
  name: 'feature-team',
  members: [{ role: 'architect', count: 1, strategy: null }],
  workflow: [{ from: 'architect', then: 'done', outcomes: [] }],
};

function seat(role: string, proposer: boolean): CouncilSeat {
  return { role, lens: role, proposer, contrarian: false, model: null };
}

function council(
  seats: readonly CouncilSeat[],
  authority: AuthorityPolicy,
  roundsCap: number,
): CouncilDeclaration {
  return {
    name: 'architecture-council',
    seats,
    tunables: { roundsCap, blockingThreshold: 'high', wallTimeMs: null },
    authority,
  };
}

function preference(role: string): TypedPosition {
  return {
    seat: role,
    lens: role,
    kind: 'preference',
    domain: role,
    severity: 'low',
    concern: 'faster_delivery',
  };
}

function objection(role: string): TypedPosition {
  return {
    seat: role,
    lens: role,
    kind: 'objection',
    domain: role,
    severity: 'high',
    concern: `${role}_blocks`,
  };
}

interface Harness {
  readonly launches: LaunchRequest[];
  readonly input: (overrides: Partial<DeliberationInput>) => DeliberationInput;
}

function harness(positions: Record<string, TypedPosition>): Harness {
  const launches: LaunchRequest[] = [];
  const pipeline: PipelineReport = {
    team: 'feature-team',
    task: 'p',
    outcome: 'succeeded',
    stages: [],
    haltedAt: null,
  };
  return {
    launches,
    input: (overrides: Partial<DeliberationInput>): DeliberationInput => ({
      council: council(
        [seat('architect', false), seat('sre', false)],
        'proceed',
        3,
      ),
      question: 'service-decomposition',
      attachedProposal: 'modular-monolith',
      team: TEAM,
      humanSigned: false,
      seatInvoker: (invocation: SeatInvocation): Promise<TypedPosition> =>
        Promise.resolve(
          positions[invocation.seat.role] ?? preference(invocation.seat.role),
        ),
      proposerAction: (): Promise<string> => Promise.resolve('revised'),
      claimKeyOf: (argument): string => argument.claim,
      launch: (request: LaunchRequest): Promise<PipelineReport> => {
        launches.push(request);
        return Promise.resolve(pipeline);
      },
      clock: (): number => 0,
      ...overrides,
    }),
  };
}

describe('runDeliberation', () => {
  it('closes as passed and launches the team pipeline under proceed authority', async () => {
    const h: Harness = harness({});
    const outcome: DeliberationOutcome = await runDeliberation(h.input({}));

    expect(outcome.record.consent).toBe('passed');
    expect(outcome.record.humanDecisionRequired).toBe(false);
    expect(outcome.authority.resolution).toBe('proceed');
    expect(outcome.bridge.launched).toBe(true);
    expect(h.launches[0]?.proposal).toBe('modular-monolith');
  });

  it('collapses echoed supporting arguments into endorsements in the record', async () => {
    const h: Harness = harness({});
    const outcome: DeliberationOutcome = await runDeliberation(h.input({}));

    const argument = outcome.record.supportingArguments.find(
      (a) => a.claim === 'faster_delivery',
    );
    expect(argument?.endorsements).toBe(2);
  });

  it('closes as blocked with dissent when a standing objection has no proposer to revise it', async () => {
    const h: Harness = harness({ sre: objection('sre') });
    const outcome: DeliberationOutcome = await runDeliberation(
      h.input({
        council: council(
          [seat('architect', false), seat('sre', false)],
          'proceed',
          3,
        ),
      }),
    );

    expect(outcome.record.consent).toBe('blocked');
    expect(outcome.record.humanDecisionRequired).toBe(true);
    expect(outcome.authority.resolution).toBe('escalate');
    expect(outcome.bridge.launched).toBe(false);
    expect(outcome.record.objections.some((o) => o.seat === 'sre')).toBe(true);
  });

  it('closes as bankrupt when the rounds cap is hit without consent', async () => {
    const h: Harness = harness({ sre: objection('sre') });
    const outcome: DeliberationOutcome = await runDeliberation(
      h.input({
        council: council(
          [seat('architect', true), seat('sre', false)],
          'proceed',
          1,
        ),
      }),
    );

    expect(outcome.record.consent).toBe('bankrupt');
    expect(outcome.bridge.launched).toBe(false);
  });
});
