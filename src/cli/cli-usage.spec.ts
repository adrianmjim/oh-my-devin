import { describe, expect, it } from 'vitest';
import { ALL_LAYER_COMPONENTS } from '../layer/layer-component';
import { CLI_USAGE } from './cli-usage';

describe('CLI_USAGE', () => {
  it('opens with the tool summary', () => {
    expect(
      CLI_USAGE.startsWith('omd — an organizational layer over the Devin CLI'),
    ).toBe(true);
  });

  it('documents every top-level command', () => {
    for (const command of [
      'omd run',
      'omd status',
      'omd doctor',
      'omd roles list',
      'omd roles show',
      'omd setup',
      'omd plugin build',
      'omd team run',
      'omd council run',
      'omd mode',
      'omd --version',
    ]) {
      expect(CLI_USAGE).toContain(command);
    }
  });

  it('names every installable layer component in the setup line', () => {
    for (const component of ALL_LAYER_COMPONENTS) {
      expect(CLI_USAGE).toContain(component);
    }
  });

  it('ends with a blank line so the block prints spaced', () => {
    expect(CLI_USAGE.endsWith('\n')).toBe(true);
  });
});
