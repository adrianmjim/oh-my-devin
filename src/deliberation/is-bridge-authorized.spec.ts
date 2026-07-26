import { describe, expect, it } from 'vitest';
import type { ClosureState } from './closure-state';
import type { DecisionRecord } from './decision-record';
import { isBridgeAuthorized } from './is-bridge-authorized';

function record(
  consent: ClosureState,
  humanDecisionRequired: boolean,
): DecisionRecord {
  return {
    question: 'should we ship?',
    proposal: 'ship it',
    proposalSource: 'attached',
    consent,
    authorityApplied: 'human',
    supportingArguments: [],
    objections: [],
    assumptions: [],
    reconsiderWhen: [],
    humanDecisionRequired,
  };
}

describe('isBridgeAuthorized', () => {
  it('authorizes a passed record needing no human decision', () => {
    expect(isBridgeAuthorized(record('passed', false), false)).toBe(true);
  });

  it('refuses a record that did not pass', () => {
    expect(isBridgeAuthorized(record('blocked', false), true)).toBe(false);
    expect(isBridgeAuthorized(record('bankrupt', false), true)).toBe(false);
  });

  it('requires the human signature when the record demands a decision', () => {
    expect(isBridgeAuthorized(record('passed', true), false)).toBe(false);
    expect(isBridgeAuthorized(record('passed', true), true)).toBe(true);
  });
});
