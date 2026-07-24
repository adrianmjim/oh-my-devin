import { describe, expect, it } from 'vitest';
import { UsageError } from '../run/usage-error';
import type { TeamRunInvocation } from './team-run-invocation';
import { resolveTeamRunInvocation } from './resolve-team-run-invocation';

describe('resolveTeamRunInvocation', () => {
  it('reads two positionals as the team and the task', () => {
    const invocation: TeamRunInvocation = resolveTeamRunInvocation([
      'delivery',
      'ship it',
    ]);

    expect(invocation).toEqual({ team: 'delivery', task: 'ship it' });
  });

  it('resolves a single positional to the default team and that task', () => {
    const invocation: TeamRunInvocation = resolveTeamRunInvocation(['ship it']);

    expect(invocation).toEqual({ team: 'default', task: 'ship it' });
  });

  it('rejects zero positionals as a usage error', () => {
    expect(() => resolveTeamRunInvocation([])).toThrow(UsageError);
  });

  it('rejects more than two positionals as a usage error', () => {
    expect(() => resolveTeamRunInvocation(['a', 'b', 'c'])).toThrow(UsageError);
  });
});
