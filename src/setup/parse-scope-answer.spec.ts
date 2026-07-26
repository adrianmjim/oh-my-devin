import { describe, expect, it } from 'vitest';
import type { LayerComponent } from '../layer/layer-component';
import { parseScopeAnswer } from './parse-scope-answer';

describe('parseScopeAnswer', () => {
  it('parses a single component', () => {
    expect(parseScopeAnswer('roles')).toEqual(['roles']);
  });

  it('parses a comma-separated subset, trimming each part', () => {
    const parsed: readonly LayerComponent[] | null =
      parseScopeAnswer('roles , skills');
    expect(parsed).toEqual(['roles', 'skills']);
  });

  it('rejects an answer naming an unknown component', () => {
    expect(parseScopeAnswer('roles,ghosts')).toBeNull();
  });

  it('rejects an empty answer', () => {
    expect(parseScopeAnswer('')).toBeNull();
  });

  it('rejects an answer of separators only', () => {
    expect(parseScopeAnswer(',,')).toBeNull();
  });

  it('keeps a component named twice, leaving deduplication to the resolver', () => {
    expect(parseScopeAnswer('roles,roles')).toEqual(['roles', 'roles']);
  });
});
