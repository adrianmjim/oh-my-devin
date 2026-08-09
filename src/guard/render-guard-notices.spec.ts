import { describe, expect, it } from 'vitest';
import { guardMessage } from './guard-message';
import { renderGuardNotices } from './render-guard-notices';

describe('renderGuardNotices', () => {
  it('renders nothing for an empty queue', () => {
    expect(renderGuardNotices([])).toBe('');
  });

  it("carries each warned write's target and the contract", () => {
    const rendered: string = renderGuardNotices([
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]);

    expect(rendered).toContain('src/a.ts');
    expect(rendered).toContain(guardMessage('src/a.ts'));
  });

  it('carries every queued write', () => {
    const rendered: string = renderGuardNotices([
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
      { tool: 'create', filePath: 'src/b.ts', noticedAt: 2 },
    ]);

    expect(rendered).toContain('src/a.ts');
    expect(rendered).toContain('src/b.ts');
  });

  it('names no concrete role', () => {
    const rendered: string = renderGuardNotices([
      { tool: 'edit', filePath: 'src/a.ts', noticedAt: 1 },
    ]).toLowerCase();

    for (const role of ['architect', 'executor', 'critic', 'debugger']) {
      expect(rendered).not.toContain(role);
    }
  });
});
