import { describe, expect, it } from 'vitest';
import { parseTransition } from './parse-transition';
import { TeamDefinitionError } from './team-definition-error';

const NODES: ReadonlySet<string> = new Set(['executor', 'reviewer', 'done']);

describe('parseTransition', () => {
  it('parses the plain successor', () => {
    expect(parseTransition('architect', { then: 'executor' }, NODES)).toEqual({
      from: 'architect',
      then: 'executor',
      outcomes: [],
    });
  });

  it('parses the outcome transitions', () => {
    expect(
      parseTransition(
        'reviewer',
        { on_passed: 'done', on_blocked: 'executor' },
        NODES,
      ),
    ).toEqual({
      from: 'reviewer',
      then: null,
      outcomes: [
        { outcome: 'passed', to: 'done' },
        { outcome: 'blocked', to: 'executor' },
      ],
    });
  });

  it('refuses a transition that is not a mapping', () => {
    expect(() => parseTransition('architect', 'executor', NODES)).toThrow(
      TeamDefinitionError,
    );
  });

  it('refuses a successor that is not a string', () => {
    expect(() => parseTransition('architect', { then: 3 }, NODES)).toThrow(
      /must name a successor/,
    );
  });

  it('refuses a successor outside the workflow', () => {
    expect(() =>
      parseTransition('architect', { then: 'ghost' }, NODES),
    ).toThrow(/unknown successor/);
  });

  it('refuses an unrecognized transition key', () => {
    expect(() =>
      parseTransition('architect', { next: 'executor' }, NODES),
    ).toThrow(/unrecognized transition key/);
  });

  it('refuses an unknown outcome', () => {
    expect(() =>
      parseTransition('architect', { on_failed: 'executor' }, NODES),
    ).toThrow(/unknown outcome/);
  });
});
