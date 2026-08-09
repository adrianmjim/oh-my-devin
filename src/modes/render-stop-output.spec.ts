import { describe, expect, it } from 'vitest';
import { renderStopOutput } from './render-stop-output';

describe('renderStopOutput', () => {
  it('emits a block in both documented decision shapes', () => {
    const output: Record<string, unknown> = renderStopOutput({
      decision: 'block',
      reason: 'run r-1 is running',
    });

    expect(output['decision']).toBe('block');
    expect(output['reason']).toBe('run r-1 is running');
    expect(output['hookSpecificOutput']).toEqual({
      decision: 'block',
      reason: 'run r-1 is running',
    });
  });

  it('emits an approval in both documented decision shapes', () => {
    const output: Record<string, unknown> = renderStopOutput({
      decision: 'approve',
      reason: null,
    });

    expect(output['decision']).toBe('approve');
    expect(output['hookSpecificOutput']).toEqual({ decision: 'approve' });
  });

  it('carries an approval message when the bound defers to the user', () => {
    const output: Record<string, unknown> = renderStopOutput({
      decision: 'approve',
      reason: 'deferring to you',
    });

    expect(output['reason']).toBe('deferring to you');
    expect(output['hookSpecificOutput']).toEqual({
      decision: 'approve',
      reason: 'deferring to you',
    });
  });
});
