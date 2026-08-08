import { describe, expect, it } from 'vitest';
import { renderModeReport } from './render-mode-report';

describe('renderModeReport', () => {
  it('reports an activation that joined nothing', () => {
    expect(
      renderModeReport({ kind: 'joined', mode: 'plan', alongside: [] }),
    ).toBe('mode set: plan');
  });

  it('names what the activation joined alongside', () => {
    expect(
      renderModeReport({
        kind: 'joined',
        mode: 'plan',
        alongside: ['autopilot'],
      }),
    ).toBe('mode set: plan (alongside autopilot)');
  });

  it('names what the activation displaced', () => {
    expect(
      renderModeReport({
        kind: 'displaced',
        mode: 'ralph',
        displaced: 'autopilot',
      }),
    ).toBe('mode set: ralph (displaced autopilot)');
  });

  it('names the holding mode and session of a refused activation', () => {
    const rendered: string = renderModeReport({
      kind: 'refused',
      mode: 'team',
      reason: 'exclusive-conflict',
      holder: { mode: 'autopilot', sessionId: 'sess-2' },
    });

    expect(rendered).toContain('team');
    expect(rendered).toContain('autopilot');
    expect(rendered).toContain('sess-2');
  });

  it('reports an unattributable activation with its reason', () => {
    const rendered: string = renderModeReport({
      kind: 'refused',
      mode: 'plan',
      reason: 'unattributable',
      holder: null,
    });

    expect(rendered).toContain('plan');
    expect(rendered).toContain('session');
  });

  it('names what a clear deactivated', () => {
    expect(
      renderModeReport({ kind: 'cleared', modes: ['plan', 'verify'] }),
    ).toBe('mode cleared: plan, verify');
  });

  it('reports a clear that deactivated nothing', () => {
    expect(renderModeReport({ kind: 'cleared', modes: [] })).toBe(
      'mode cleared: nothing was active',
    );
  });
});
