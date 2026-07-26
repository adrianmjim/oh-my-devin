import { describe, expect, it } from 'vitest';
import { renderSetupResult } from './render-setup-result';
import type { SetupResult, TargetOutcome, TargetReport } from './setup-result';

function report(
  path: string,
  outcome: TargetOutcome,
  reason: string | null = null,
): TargetReport {
  return { component: 'rules', path, outcome, reason };
}

describe('renderSetupResult', () => {
  it('distinguishes what it created from what it replaced', () => {
    const result: SetupResult = {
      targets: [
        report('AGENTS.md', 'created'),
        report('.devin/hooks.v1.json', 'updated'),
      ],
      refusals: [],
    };

    const rendered: string = renderSetupResult(result);

    expect(rendered).toContain('Created:');
    expect(rendered).toContain('  AGENTS.md');
    expect(rendered).toContain('Updated:');
    expect(rendered).toContain('  .devin/hooks.v1.json');
    expect(rendered.indexOf('AGENTS.md')).toBeLessThan(
      rendered.indexOf('.devin/hooks.v1.json'),
    );
  });

  it('names the reason next to everything it did not write', () => {
    const result: SetupResult = {
      targets: [
        report('.devin/teams/default.yaml', 'preserved', 'you edited it'),
        report('.devin/skills/plan/SKILL.md', 'conflicted', 'it is not omd’s'),
        report('config.json', 'blocked', 'it is not readable JSON'),
      ],
      refusals: [],
    };

    const rendered: string = renderSetupResult(result);

    expect(rendered).toContain('Preserved:');
    expect(rendered).toContain('.devin/teams/default.yaml — you edited it');
    expect(rendered).toContain('Conflicted:');
    expect(rendered).toContain('.devin/skills/plan/SKILL.md — it is not omd’s');
    expect(rendered).toContain('Blocked:');
    expect(rendered).toContain('config.json — it is not readable JSON');
  });

  it('reports what it left alone because it was already installed', () => {
    const result: SetupResult = {
      targets: [report('AGENTS.md', 'unchanged')],
      refusals: [],
    };

    expect(renderSetupResult(result)).toContain('Unchanged:');
  });

  it('leaves out a group that holds nothing', () => {
    const result: SetupResult = {
      targets: [report('AGENTS.md', 'created')],
      refusals: [],
    };

    const rendered: string = renderSetupResult(result);

    expect(rendered).not.toContain('Updated:');
    expect(rendered).not.toContain('Conflicted:');
  });

  it('reports each refusal naming the component and the reason', () => {
    const result: SetupResult = {
      targets: [],
      refusals: [
        {
          component: 'teams',
          reason: 'no verified user-level discovery location',
        },
      ],
    };

    const rendered: string = renderSetupResult(result);

    expect(rendered).toContain('Refused:');
    expect(rendered).toContain('  teams — no verified user-level');
  });

  it('says so when there was nothing to do', () => {
    expect(renderSetupResult({ targets: [], refusals: [] })).toBe(
      'Nothing to install.',
    );
  });
});
