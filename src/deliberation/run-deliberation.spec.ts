import { describe, expect, it } from 'vitest';
import type { CouncilDeclaration } from '../council/council-declaration';
import type { CouncilSeat } from '../council/council-seat';
import type { AuthorityPolicy } from '../council/authority-policy';
import type { PipelineReport } from '../pipeline/pipeline-report';
import type { TeamDefinition } from '../team/team-definition';
import type { AnonymizedArgument } from './anonymized-argument';
import type { ClaimClusters } from './claim-clusters';
import type { DeliberationInput } from './deliberation-input';
import type { DeliberationOutcome } from './deliberation-outcome';
import type { LaunchRequest } from './pipeline-launcher';
import type { SeatInvocation } from './seat-invocation';
import type { SeatPosition } from './seat-position';
import type { TypedPosition } from './typed-position';
import { runDeliberation } from './run-deliberation';

const TEAM: TeamDefinition = {
  name: 'feature-team',
  members: [{ role: 'architect', count: 1, strategy: null }],
  workflow: [{ from: 'architect', then: 'done', outcomes: [] }],
};

function seat(role: string, proposer: boolean): CouncilSeat {
  return {
    id: role,
    role,
    lens: role,
    proposer,
    contrarian: false,
    model: null,
  };
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
    assumptions: [],
    reconsiderWhen: [],
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
    assumptions: [],
    reconsiderWhen: [],
  };
}

interface Harness {
  readonly launches: LaunchRequest[];
  readonly summarized: AnonymizedArgument[][];
  readonly positionBatches: SeatInvocation[][];
  readonly input: (overrides: Partial<DeliberationInput>) => DeliberationInput;
}

function byClaimText(claims: readonly string[]): Promise<ClaimClusters> {
  const groups: number[][] = [];
  const groupByClaim: Map<string, number[]> = new Map<string, number[]>();
  claims.forEach((claim: string, index: number): void => {
    const existing: number[] | undefined = groupByClaim.get(claim);
    if (existing === undefined) {
      const group: number[] = [index];
      groupByClaim.set(claim, group);
      groups.push(group);
    } else {
      existing.push(index);
    }
  });
  return Promise.resolve(groups);
}

function harness(positions: Record<string, TypedPosition>): Harness {
  const launches: LaunchRequest[] = [];
  const summarized: AnonymizedArgument[][] = [];
  const positionBatches: SeatInvocation[][] = [];
  const pipeline: PipelineReport = {
    runId: 'run-deliberation',
    team: 'feature-team',
    task: 'p',
    outcome: 'succeeded',
    stages: [],
    haltedAt: null,
  };
  return {
    launches,
    summarized,
    positionBatches,
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
      seatInvoker: (
        invocations: readonly SeatInvocation[],
      ): Promise<readonly SeatPosition[]> => {
        if (invocations[0]?.phase === 'clarification') {
          return Promise.resolve(
            invocations.map((invocation: SeatInvocation): SeatPosition => ({
              seat: invocation.seat.role,
              lens: invocation.seat.lens,
              kind: 'clarification',
              questions: [],
            })),
          );
        }
        positionBatches.push([...invocations]);
        return Promise.resolve(
          invocations.map(
            (invocation: SeatInvocation): SeatPosition =>
              positions[invocation.seat.role] ??
              preference(invocation.seat.role),
          ),
        );
      },
      proposerAction: () =>
        Promise.resolve({ proposal: 'revised', clarifications: [] }),
      clusterArguments: byClaimText,
      summarizeEvidence: (
        args: readonly AnonymizedArgument[],
      ): Promise<string | null> => {
        summarized.push([...args]);
        return Promise.resolve('round-summary');
      },
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

  it('aggregates deduplicated assumptions and reconsider_when triggers into the record', async () => {
    const h: Harness = harness({
      architect: {
        ...preference('architect'),
        assumptions: ['stable_team', 'single_region'],
        reconsiderWhen: ['multi_region_needed'],
      },
      sre: {
        ...objection('sre'),
        assumptions: ['single_region', 'low_traffic'],
        reconsiderWhen: ['multi_region_needed', 'traffic_doubles'],
      },
    });
    const outcome: DeliberationOutcome = await runDeliberation(h.input({}));

    expect(outcome.record.consent).toBe('blocked');
    expect(outcome.record.assumptions).toEqual([
      'stable_team',
      'single_region',
      'low_traffic',
    ]);
    expect(outcome.record.reconsiderWhen).toEqual([
      'multi_region_needed',
      'traffic_doubles',
    ]);
  });

  it('relays the anonymized evidence summary of a round to the next round', async () => {
    const h: Harness = harness({ sre: objection('sre') });
    await runDeliberation(h.input({}));

    expect(h.positionBatches[0]?.[0]?.evidenceSummary).toBeNull();
    expect(h.positionBatches[1]?.[0]?.evidenceSummary).toBe('round-summary');
    for (const argument of h.summarized[0] ?? []) {
      expect('seat' in argument).toBe(false);
    }
  });

  it('counts utility invocations separately from the seat sessions', async () => {
    const h: Harness = harness({ sre: objection('sre') });
    const outcome: DeliberationOutcome = await runDeliberation(h.input({}));

    expect(outcome.record.consent).toBe('blocked');
    expect(outcome.utilityTurns).toBe(3);
  });

  it('computes the same closure whatever the moderation utilities return', async () => {
    const positions: Record<string, TypedPosition> = {
      sre: objection('sre'),
    };
    const assisted: Harness = harness(positions);
    const degraded: Harness = harness(positions);

    const withUtilities: DeliberationOutcome = await runDeliberation(
      assisted.input({}),
    );
    const withoutUtilities: DeliberationOutcome = await runDeliberation(
      degraded.input({
        clusterArguments: (claims: readonly string[]): Promise<ClaimClusters> =>
          Promise.resolve(claims.length > 0 ? [claims.map((_, i) => i)] : []),
        summarizeEvidence: (): Promise<string | null> => Promise.resolve(null),
      }),
    );

    expect(withoutUtilities.record.consent).toBe(withUtilities.record.consent);
    expect(withoutUtilities.record.humanDecisionRequired).toBe(
      withUtilities.record.humanDecisionRequired,
    );
    expect(withoutUtilities.record.objections).toEqual(
      withUtilities.record.objections,
    );
  });
});
