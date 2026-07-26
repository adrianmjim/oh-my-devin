import { describe, expect, it } from 'vitest';
import { ROLE_ARTIFACT } from './role-artifact';

describe('ROLE_ARTIFACT', () => {
  it('names the artifact each pipeline stage produces', () => {
    expect(ROLE_ARTIFACT).toEqual({
      architect: 'architecture.json',
      executor: 'evidence.json',
      reviewer: 'review.json',
    });
  });

  it('gives every stage a distinct artifact', () => {
    expect(new Set(Object.values(ROLE_ARTIFACT)).size).toBe(
      Object.keys(ROLE_ARTIFACT).length,
    );
  });
});
