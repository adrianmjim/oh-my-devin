import { describe, expect, it } from 'vitest';
import { isValidRunId } from './is-valid-run-id';
import { resolveRunId } from './resolve-run-id';

describe('resolveRunId', () => {
  it('adopts a requested identity with a safe shape', () => {
    expect(resolveRunId('run-1')).toBe('run-1');
  });

  it('generates a fresh identity when none is requested', () => {
    const resolved: string = resolveRunId(undefined);
    expect(isValidRunId(resolved)).toBe(true);
  });

  it('discards a path-traversing request and generates a fresh identity', () => {
    const resolved: string = resolveRunId('../escape');
    expect(resolved).not.toBe('../escape');
    expect(isValidRunId(resolved)).toBe(true);
  });
});
