import { describe, expect, it } from 'vitest';
import { TEAM_RUN_USAGE } from './team-run-usage';

describe('TEAM_RUN_USAGE', () => {
  it('states the team run invocation', () => {
    expect(TEAM_RUN_USAGE).toBe(
      'usage: omd team run [<team>] "<task>" [--json]',
    );
  });

  it('marks the team as optional and the task as required', () => {
    expect(TEAM_RUN_USAGE).toContain('[<team>]');
    expect(TEAM_RUN_USAGE).toContain('"<task>"');
  });
});
