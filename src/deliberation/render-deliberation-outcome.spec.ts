import { describe, expect, it } from 'vitest';
import { deliberationOutcome } from './deliberation-outcome-fixture';
import { renderDeliberationOutcome } from './render-deliberation-outcome';

describe('renderDeliberationOutcome', () => {
  it('summarizes a passed deliberation with its authority resolution', () => {
    const text: string = renderDeliberationOutcome(
      deliberationOutcome('passed', 'proceed', true),
    );
    expect(text).toContain('passed');
    expect(text).toContain('should we ship?');
    expect(text).toContain('proceed');
    expect(text).toContain('team pipeline launched: true');
  });

  it('shows escalation and carried dissent when the gate escalates', () => {
    const text: string = renderDeliberationOutcome(
      deliberationOutcome('passed', 'escalate', false),
    );
    expect(text).toContain('escalate');
    expect(text).toContain('dissent carried: 1');
  });
});
