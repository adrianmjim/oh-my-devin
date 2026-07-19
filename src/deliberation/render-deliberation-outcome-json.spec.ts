import { describe, expect, it } from 'vitest';
import { deliberationOutcome } from './deliberation-outcome-fixture';
import type { JsonDeliberationOutcome } from './json-deliberation-outcome';
import { renderDeliberationOutcomeJson } from './render-deliberation-outcome-json';

describe('renderDeliberationOutcomeJson', () => {
  it('projects a passed outcome with exit code 0', () => {
    const json: JsonDeliberationOutcome = renderDeliberationOutcomeJson(
      deliberationOutcome('passed', 'proceed', true),
    );
    expect(json.closure).toBe('passed');
    expect(json.exitCode).toBe(0);
    expect(json.bridgeLaunched).toBe(true);
    expect(json.objections).toBe(1);
  });

  it('projects a blocked outcome with a non-zero exit code and dissent', () => {
    const json: JsonDeliberationOutcome = renderDeliberationOutcomeJson(
      deliberationOutcome('blocked', 'escalate', false),
    );
    expect(json.closure).toBe('blocked');
    expect(json.exitCode).not.toBe(0);
    expect(json.dissent).toBe(1);
    expect(json.humanDecisionRequired).toBe(true);
  });
});
