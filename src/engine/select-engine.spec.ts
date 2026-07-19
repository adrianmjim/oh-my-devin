import { describe, expect, it } from 'vitest';
import type { Engine } from './engine';
import { DevinHeadlessEngine } from './devin-headless-engine';
import { selectEngine } from './select-engine';

describe('selectEngine', () => {
  it('selects the Devin headless engine for the `devin` engine value', () => {
    const engine: Engine = selectEngine('devin');

    expect(engine).toBeInstanceOf(DevinHeadlessEngine);
    expect(engine.kind).toBe('devin');
  });
});
