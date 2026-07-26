import { describe, expect, it } from 'vitest';
import { deliberationOutcomeFixture } from './deliberation-outcome-fixture';

describe('deliberationOutcomeFixture', () => {
  it('builds an outcome carrying the closure it is given', () => {
    expect(
      deliberationOutcomeFixture('passed', 'proceed', false).record.consent,
    ).toBe('passed');
  });

  it('requires a human decision only when the gate escalates', () => {
    expect(
      deliberationOutcomeFixture('passed', 'escalate', false).record
        .humanDecisionRequired,
    ).toBe(true);
    expect(
      deliberationOutcomeFixture('passed', 'proceed', false).record
        .humanDecisionRequired,
    ).toBe(false);
  });

  it('carries the dissent only when the gate escalates', () => {
    expect(
      deliberationOutcomeFixture('passed', 'escalate', false).authority.dissent,
    ).toHaveLength(1);
    expect(
      deliberationOutcomeFixture('passed', 'proceed', false).authority.dissent,
    ).toEqual([]);
  });

  it('reports the bridge launch it is given', () => {
    expect(
      deliberationOutcomeFixture('passed', 'proceed', true).bridge.launched,
    ).toBe(true);
  });
});
