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

  it('reports each refusal naming the component and the reason', () => {
    const result: SetupResult = {
      writtenPaths: [],
      refusals: [
        {
          component: 'teams',
          reason: 'no verified user-level discovery location',
        },
      ],
    };
    const text: string = renderSetupResult(result);
    expect(text).toContain('refused teams:');
    expect(text).toContain('no verified user-level discovery location');
  });
});
