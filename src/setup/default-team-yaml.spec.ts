import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { DEFAULT_TEAM_YAML } from './default-team-yaml';

describe('DEFAULT_TEAM_YAML', () => {
  it('declares a team named default', () => {
    const parsed: Record<string, unknown> = parse(DEFAULT_TEAM_YAML) as Record<
      string,
      unknown
    >;

    expect(parsed['name']).toBe('default');
  });

  it('staffs one of each shipped role', () => {
    const parsed: Record<string, unknown> = parse(DEFAULT_TEAM_YAML) as Record<
      string,
      unknown
    >;

    expect(parsed['members']).toEqual([
      { role: 'architect', count: 1 },
      { role: 'executor', count: 1 },
      { role: 'reviewer', count: 1 },
    ]);
  });

  it('wires the architect to executor to reviewer workflow', () => {
    const parsed: Record<string, unknown> = parse(DEFAULT_TEAM_YAML) as Record<
      string,
      unknown
    >;

    expect(parsed['workflow']).toEqual({
      architect: { then: 'executor' },
      executor: { then: 'reviewer' },
      reviewer: { on_passed: 'done', on_blocked: 'executor' },
    });
  });
});
