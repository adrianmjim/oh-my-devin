import { describe, expect, it } from 'vitest';
import { renderTargetEntry } from './render-target-entry';

describe('renderTargetEntry', () => {
  it('indents the path of a report with no reason', () => {
    expect(
      renderTargetEntry({
        component: 'rules',
        path: '.devin/rules.md',
        outcome: 'created',
        reason: null,
      }),
    ).toBe('  .devin/rules.md');
  });

  it('appends the reason when the report carries one', () => {
    expect(
      renderTargetEntry({
        component: 'hooks',
        path: '.devin/hooks.v1.json',
        outcome: 'blocked',
        reason: 'it is not a JSON object omd can read',
      }),
    ).toBe('  .devin/hooks.v1.json — it is not a JSON object omd can read');
  });
});
