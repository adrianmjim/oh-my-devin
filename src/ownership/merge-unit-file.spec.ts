import { describe, expect, it } from 'vitest';
import { frameUnit } from './frame-unit';
import { mergeUnitFile } from './merge-unit-file';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import type { RegionFraming } from './region-framing';

const FRAMING: RegionFraming = {
  id: 'skill-plan',
  version: '1.2.3',
  style: 'markdown',
  content: '---\nname: plan\n---\n\nPlan the work.\n',
};

function request(existing: string | null): MergeRequest {
  return { existing, framing: FRAMING };
}

describe('mergeUnitFile', () => {
  it('creates an absent file framed', () => {
    const outcome: MergeOutcome = mergeUnitFile(request(null));

    expect(outcome).toEqual({ kind: 'created', content: frameUnit(FRAMING) });
  });

  it('conflicts on an existing unmarked file rather than appending to it', () => {
    const existing: string = '---\nname: plan\n---\n\nMy own plan skill.\n';

    const outcome: MergeOutcome = mergeUnitFile(request(existing));

    expect(outcome.kind).toBe('conflicted');
    expect(outcome.kind === 'conflicted' && outcome.reason.length > 0).toBe(
      true,
    );
  });

  it('replaces a pristine region with the newer content', () => {
    const updated: RegionFraming = {
      ...FRAMING,
      content: '---\nname: plan\n---\n\nPlan the work, carefully.\n',
    };

    const outcome: MergeOutcome = mergeUnitFile({
      existing: frameUnit(FRAMING),
      framing: updated,
    });

    expect(outcome).toEqual({ kind: 'updated', content: frameUnit(updated) });
  });

  it('reports unchanged when the framed content is identical', () => {
    const outcome: MergeOutcome = mergeUnitFile(request(frameUnit(FRAMING)));

    expect(outcome).toEqual({ kind: 'unchanged' });
  });

  it('preserves a body the user has edited', () => {
    const existing: string = frameUnit(FRAMING).replace(
      'Plan the work.',
      'Plan the work my way.',
    );

    const outcome: MergeOutcome = mergeUnitFile(request(existing));

    expect(outcome.kind).toBe('preserved');
  });

  it('detects an edit to the frontmatter, which sits outside the sentinels', () => {
    const existing: string = frameUnit(FRAMING).replace(
      'name: plan',
      'name: plan\nomd-max-turns: 12',
    );

    const outcome: MergeOutcome = mergeUnitFile(request(existing));

    expect(outcome.kind).toBe('preserved');
  });

  it('detects an edit to the shebang, which sits outside the sentinels', () => {
    const script: RegionFraming = {
      id: 'hook-script',
      version: '1.2.3',
      style: 'script',
      content: '#!/usr/bin/env node\nconst phase = 1;\n',
    };
    const existing: string = frameUnit(script).replace(
      '#!/usr/bin/env node',
      '#!/usr/bin/env -S node --no-warnings',
    );

    const outcome: MergeOutcome = mergeUnitFile({
      existing,
      framing: script,
    });

    expect(outcome.kind).toBe('preserved');
  });

  it('preserves content the user appended after the end sentinel', () => {
    const existing: string = `${frameUnit(FRAMING)}\nMy own trailing note.\n`;

    const outcome: MergeOutcome = mergeUnitFile(request(existing));

    expect(outcome.kind).toBe('preserved');
  });

  it('conflicts on a malformed region rather than guessing', () => {
    const existing: string = `${frameUnit(FRAMING)}${frameUnit(FRAMING)}`;

    const outcome: MergeOutcome = mergeUnitFile(request(existing));

    expect(outcome.kind).toBe('conflicted');
  });
});
