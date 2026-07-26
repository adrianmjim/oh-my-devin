import { describe, expect, it } from 'vitest';
import type { TeamTransition } from '../team/team-transition';
import { resolveSuccessor } from './resolve-successor';

const WITH_OUTCOMES: TeamTransition = {
  from: 'reviewer',
  then: 'done',
  outcomes: [
    { outcome: 'passed', to: 'done' },
    { outcome: 'blocked', to: 'executor' },
  ],
};

const PLAIN: TeamTransition = {
  from: 'architect',
  then: 'executor',
  outcomes: [],
};

describe('resolveSuccessor', () => {
  it('is null when the stage has no transition', () => {
    expect(resolveSuccessor(null, 'approve')).toBeNull();
  });

  it('takes the passed outcome on approval', () => {
    expect(resolveSuccessor(WITH_OUTCOMES, 'approve')).toBe('done');
  });

  it('falls back to the plain successor when no outcome matches', () => {
    expect(resolveSuccessor(PLAIN, 'approve')).toBe('executor');
  });

  it('takes the blocked outcome on rejection', () => {
    expect(resolveSuccessor(WITH_OUTCOMES, 'reject')).toBe('executor');
  });

  it('halts on a rejection the workflow does not route', () => {
    expect(resolveSuccessor(PLAIN, 'reject')).toBeNull();
  });

  it('halts when the gate produced no decision', () => {
    expect(resolveSuccessor(WITH_OUTCOMES, 'none')).toBeNull();
  });
});
