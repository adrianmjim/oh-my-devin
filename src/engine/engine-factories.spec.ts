import { describe, expect, it } from 'vitest';
import { DevinHeadlessEngine } from './devin-headless-engine';
import { ENGINE_FACTORIES } from './engine-factories';

describe('ENGINE_FACTORIES', () => {
  it('builds the headless engine for the devin kind', () => {
    expect(ENGINE_FACTORIES.devin()).toBeInstanceOf(DevinHeadlessEngine);
  });

  it('builds a fresh engine per call', () => {
    expect(ENGINE_FACTORIES.devin()).not.toBe(ENGINE_FACTORIES.devin());
  });
});
