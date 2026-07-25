import { describe, expect, it } from 'vitest';
import { renderSetupResult } from './render-setup-result';
import type { SetupResult } from './setup-result';

describe('renderSetupResult', () => {
  it('reports the count and each written path', () => {
    const result: SetupResult = {
      writtenPaths: ['AGENTS.md', '.devin/hooks.v1.json'],
      refusals: [],
    };
    const text: string = renderSetupResult(result);
    expect(text).toContain('Installed 2 files:');
    expect(text).toContain('  AGENTS.md');
    expect(text).toContain('  .devin/hooks.v1.json');
    expect(text).not.toContain('refused');
  });

  it('reports each refusal naming the component and the alternative channel', () => {
    const result: SetupResult = {
      writtenPaths: [],
      refusals: [
        {
          component: 'skills',
          reason:
            'no verified user-level discovery location; install it through the devin plugin channel instead',
        },
      ],
    };
    const text: string = renderSetupResult(result);
    expect(text).toContain('refused skills:');
    expect(text).toContain('devin plugin channel');
  });
});
