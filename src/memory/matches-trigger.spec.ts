import { describe, expect, it } from 'vitest';
import { matchesTrigger } from './matches-trigger';

describe('matchesTrigger', () => {
  it('matches a trigger standing as its own word', () => {
    expect(matchesTrigger('please deploy the api', 'deploy')).toBe(true);
    expect(matchesTrigger('deploy', 'deploy')).toBe(true);
    expect(matchesTrigger('the deploy, tonight', 'deploy')).toBe(true);
  });

  it('never matches a trigger buried inside a longer word', () => {
    expect(matchesTrigger('redeployment notes', 'deploy')).toBe(false);
  });

  it('ignores the case of both sides', () => {
    expect(matchesTrigger('Deploy It', 'DEPLOY')).toBe(true);
  });

  it('matches a multi-word trigger', () => {
    expect(matchesTrigger('mind the release branch', 'release branch')).toBe(
      true,
    );
  });

  it('never matches an empty trigger', () => {
    expect(matchesTrigger('anything at all', '  ')).toBe(false);
  });

  it('reads a trigger as text, never as a pattern', () => {
    expect(matchesTrigger('anything at all', '.*')).toBe(false);
  });
});
