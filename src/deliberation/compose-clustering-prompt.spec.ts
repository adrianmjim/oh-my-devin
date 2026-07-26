import { describe, expect, it } from 'vitest';
import { composeClusteringPrompt } from './compose-clustering-prompt';

describe('composeClusteringPrompt', () => {
  it('lists every claim under its zero-based index', () => {
    const prompt: string = composeClusteringPrompt(['ship it', 'wait']);

    expect(prompt).toContain('0. ship it');
    expect(prompt).toContain('1. wait');
  });

  it('states the near-identical clustering rule', () => {
    expect(composeClusteringPrompt(['a'])).toContain('near-identical');
  });

  it('asks for a JSON array of arrays covering every index once', () => {
    const prompt: string = composeClusteringPrompt(['a']);

    expect(prompt).toContain('JSON array of arrays');
    expect(prompt).toContain('every index exactly once');
  });
});
