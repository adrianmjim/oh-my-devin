import { describe, expect, it } from 'vitest';
import { DEFAULT_TEAM_NAME } from './default-team-name';

describe('DEFAULT_TEAM_NAME', () => {
  it('names the team launched when the invocation omits one', () => {
    expect(DEFAULT_TEAM_NAME).toBe('default');
  });
});
