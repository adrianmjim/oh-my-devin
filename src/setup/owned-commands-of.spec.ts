import { describe, expect, it } from 'vitest';
import { buildHooksEventMap } from './build-hooks-event-map';
import type { HooksEventMap } from './hooks-event-map';
import { ownedCommandsOf } from './owned-commands-of';

describe('ownedCommandsOf', () => {
  it('collects every command the claimed event map installs', () => {
    const hooksMap: HooksEventMap = buildHooksEventMap('node run.mjs');

    expect([...ownedCommandsOf(hooksMap, [])].sort()).toEqual([
      'node run.mjs session-start',
      'node run.mjs stop',
      'node run.mjs tool-use',
      'node run.mjs user-prompt',
    ]);
  });

  it('keeps the legacy commands owned so earlier installs stay claimable', () => {
    const hooksMap: HooksEventMap = buildHooksEventMap('node run.mjs');

    expect(
      ownedCommandsOf(hooksMap, ['node old.mjs stop']).has('node old.mjs stop'),
    ).toBe(true);
  });
});
