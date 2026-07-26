import { describe, expect, it } from 'vitest';
import { parseWorkflow } from './parse-workflow';
import { TeamDefinitionError } from './team-definition-error';

const MEMBERS: ReadonlySet<string> = new Set(['architect', 'executor']);
const NODES: ReadonlySet<string> = new Set(['architect', 'executor', 'done']);

describe('parseWorkflow', () => {
  it('parses one transition per declared stage', () => {
    expect(
      parseWorkflow({ architect: { then: 'executor' } }, MEMBERS, NODES),
    ).toEqual([{ from: 'architect', then: 'executor', outcomes: [] }]);
  });

  it('refuses a workflow that is not a mapping', () => {
    expect(() => parseWorkflow([], MEMBERS, NODES)).toThrow(
      TeamDefinitionError,
    );
  });

  it('refuses a stage that is not a declared member', () => {
    expect(() =>
      parseWorkflow({ ghost: { then: 'executor' } }, MEMBERS, NODES),
    ).toThrow(/not a declared member/);
  });
});
