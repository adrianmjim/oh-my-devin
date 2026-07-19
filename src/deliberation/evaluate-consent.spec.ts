import { describe, expect, it } from 'vitest';
import type { Severity } from '../council/severity';
import type { ConsentResult } from './consent-result';
import type { TypedPosition } from './typed-position';
import { evaluateConsent } from './evaluate-consent';

function objection(overrides: Partial<TypedPosition>): TypedPosition {
  return {
    seat: 'sre',
    lens: 'operability-and-failure-modes',
    kind: 'objection',
    domain: 'operability',
    severity: 'high',
    concern: 'deployment_coupling',
    assumptions: [],
    reconsiderWhen: [],
    ...overrides,
  };
}

const HIGH: Severity = 'high';

describe('evaluateConsent', () => {
  it('blocks when an objection meets both the threshold and the lens', () => {
    const result: ConsentResult = evaluateConsent([objection({})], HIGH);
    expect(result.consented).toBe(false);
    expect(result.blocking).toHaveLength(1);
  });

  it('does not block a below-threshold objection', () => {
    const result: ConsentResult = evaluateConsent(
      [objection({ severity: 'medium' })],
      HIGH,
    );
    expect(result.consented).toBe(true);
    expect(result.blocking).toHaveLength(0);
  });

  it('does not block an out-of-lens objection regardless of severity', () => {
    const result: ConsentResult = evaluateConsent(
      [objection({ domain: 'cost', severity: 'critical' })],
      HIGH,
    );
    expect(result.consented).toBe(true);
  });

  it('never blocks a preference', () => {
    const result: ConsentResult = evaluateConsent(
      [objection({ kind: 'preference', severity: 'critical' })],
      HIGH,
    );
    expect(result.consented).toBe(true);
  });

  it('reports only the blocking objections among many positions', () => {
    const result: ConsentResult = evaluateConsent(
      [
        objection({ seat: 'sre' }),
        objection({
          seat: 'pm',
          severity: 'low',
          domain: 'scope',
          lens: 'scope',
        }),
        objection({ seat: 'sec', kind: 'preference' }),
      ],
      HIGH,
    );
    expect(result.consented).toBe(false);
    expect(result.blocking.map((p) => p.seat)).toEqual(['sre']);
  });

  it('consents when no positions are raised', () => {
    expect(evaluateConsent([], HIGH).consented).toBe(true);
  });
});
