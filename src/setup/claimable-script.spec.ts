import { describe, expect, it } from 'vitest';
import { buildHooksEventMap } from './build-hooks-event-map';
import { claimableScript } from './claimable-script';
import type { RegistryTarget } from './registry-target';
import type { TargetOutcome } from './target-outcome';

const SCRIPT_PATH: string = '/tmp/omd/.devin/hooks/omd-mode.mjs';

const TARGET: RegistryTarget = {
  kind: 'registry',
  component: 'hooks',
  absolutePath: '/tmp/omd/.devin/hooks.v1.json',
  reportPath: '.devin/hooks.v1.json',
  shape: 'document',
  scriptPath: SCRIPT_PATH,
  hooksMap: buildHooksEventMap('node run.mjs'),
  legacyCommands: [],
};

function outcomes(outcome: TargetOutcome): ReadonlyMap<string, TargetOutcome> {
  return new Map<string, TargetOutcome>([[SCRIPT_PATH, outcome]]);
}

describe('claimableScript', () => {
  it('claims the registry when omd owns the installed script', () => {
    expect(claimableScript(TARGET, outcomes('created'))).toBe(true);
    expect(claimableScript(TARGET, outcomes('unchanged'))).toBe(true);
  });

  it('does not claim the registry when the script merge failed', () => {
    expect(claimableScript(TARGET, outcomes('blocked'))).toBe(false);
    expect(claimableScript(TARGET, outcomes('conflicted'))).toBe(false);
  });

  it('does not claim the registry when the script was never written', () => {
    expect(claimableScript(TARGET, new Map<string, TargetOutcome>())).toBe(
      false,
    );
  });
});
