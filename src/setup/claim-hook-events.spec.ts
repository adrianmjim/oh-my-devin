import { describe, expect, it } from 'vitest';
import type { ClaimOutcome } from './claim-outcome';
import { claimHookEvents } from './claim-hook-events';
import { legacyHookCommands } from './legacy-hook-commands';
import { posixQuote } from './posix-quote';
import type { HooksEventMap } from './hooks-event-map';
import { buildHooksEventMap } from './build-hooks-event-map';

const OMD_MAP: HooksEventMap = buildHooksEventMap(
  'node .devin/hooks/omd-mode.mjs',
);
const FOREIGN_ENTRY: Record<string, unknown> = {
  hooks: [{ type: 'command', command: 'node ./scripts/my-guard.mjs' }],
};

function claimedOrThrow(outcome: ClaimOutcome): Record<string, unknown> {
  if (outcome.kind !== 'claimed') {
    throw new Error(`expected a claim, got ${outcome.kind}`);
  }
  return outcome.events;
}

describe('claimHookEvents', () => {
  it('leaves an event omd does not claim untouched', () => {
    const events: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({ PreToolUse: [FOREIGN_ENTRY] }, OMD_MAP, []),
    );

    expect(events['PreToolUse']).toEqual([FOREIGN_ENTRY]);
  });

  it('keeps foreign entries within a claimed event, in order', () => {
    const second: Record<string, unknown> = {
      hooks: [{ type: 'command', command: 'node ./scripts/second.mjs' }],
    };

    const events: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({ Stop: [FOREIGN_ENTRY, second] }, OMD_MAP, []),
    );

    expect(events['Stop']).toEqual([FOREIGN_ENTRY, second, ...OMD_MAP.Stop]);
  });

  it('registers omd on a claimed event the registry does not carry', () => {
    const events: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({}, OMD_MAP, []),
    );

    expect(events['SessionStart']).toEqual([...OMD_MAP.SessionStart]);
    expect(events['UserPromptSubmit']).toEqual([...OMD_MAP.UserPromptSubmit]);
    expect(events['Stop']).toEqual([...OMD_MAP.Stop]);
  });

  it('replaces omd’s previous entry rather than accumulating one', () => {
    const once: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({}, OMD_MAP, []),
    );

    const twice: Record<string, unknown> = claimedOrThrow(
      claimHookEvents(once, OMD_MAP, []),
    );

    expect(twice).toEqual(once);
  });

  it('keeps an entry running the hook script from a foreign path', () => {
    const foreign: Record<string, unknown> = {
      hooks: [{ type: 'command', command: 'node /opt/acme/omd-mode.mjs stop' }],
    };

    const events: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({ Stop: [foreign] }, OMD_MAP, []),
    );

    expect(events['Stop']).toEqual([foreign, ...OMD_MAP.Stop]);
  });

  it('claims again without accumulating when the installed path carries an apostrophe', () => {
    const script: string = "/home/O'Brien/.config/devin/hooks/omd-mode.mjs";
    const map: HooksEventMap = buildHooksEventMap(`node ${posixQuote(script)}`);

    const once: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({}, map, []),
    );

    const twice: Record<string, unknown> = claimedOrThrow(
      claimHookEvents(once, map, []),
    );

    expect(twice).toEqual(once);
  });

  it('replaces entries the previous release installed under its legacy command form', () => {
    const script: string = '/home/u/.config/devin/hooks/omd-mode.mjs';
    const previous: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({}, buildHooksEventMap(`node "${script}"`), []),
    );
    const map: HooksEventMap = buildHooksEventMap(`node ${posixQuote(script)}`);

    const events: Record<string, unknown> = claimedOrThrow(
      claimHookEvents(previous, map, legacyHookCommands(script)),
    );

    expect(events['SessionStart']).toEqual([...map.SessionStart]);
    expect(events['UserPromptSubmit']).toEqual([...map.UserPromptSubmit]);
    expect(events['Stop']).toEqual([...map.Stop]);
  });

  it('keeps sibling keys that are not events', () => {
    const events: Record<string, unknown> = claimedOrThrow(
      claimHookEvents({ version: 1 }, OMD_MAP, []),
    );

    expect(events['version']).toBe(1);
  });

  it('blocks when a claimed event holds something other than a list', () => {
    const outcome: ClaimOutcome = claimHookEvents({ Stop: {} }, OMD_MAP, []);

    expect(outcome.kind).toBe('blocked');
    expect(outcome.kind === 'blocked' && outcome.reason.length > 0).toBe(true);
  });
});
