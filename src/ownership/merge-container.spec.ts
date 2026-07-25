import { describe, expect, it } from 'vitest';
import { frameRegion } from './frame-region';
import { mergeContainer } from './merge-container';
import type { MergeOutcome } from './merge-outcome';
import type { MergeRequest } from './merge-request';
import type { RegionFraming } from './region-framing';

const FRAMING: RegionFraming = {
  id: 'rules',
  version: '1.2.3',
  style: 'markdown',
  content: 'omd rules\n',
};

function request(existing: string | null): MergeRequest {
  return { existing, framing: FRAMING };
}

function contentOrThrow(outcome: MergeOutcome): string {
  if (outcome.kind !== 'created' && outcome.kind !== 'updated') {
    throw new Error(`expected written content, got ${outcome.kind}`);
  }
  return outcome.content;
}

describe('mergeContainer', () => {
  it('creates an absent file framed', () => {
    const outcome: MergeOutcome = mergeContainer(request(null));

    expect(outcome.kind).toBe('created');
    expect(contentOrThrow(outcome)).toBe(frameRegion(FRAMING));
  });

  it('creates an empty file framed rather than appending to nothing', () => {
    const outcome: MergeOutcome = mergeContainer(request(''));

    expect(outcome.kind).toBe('created');
    expect(contentOrThrow(outcome)).toBe(frameRegion(FRAMING));
  });

  it('keeps every byte of an existing unmarked file and appends the region', () => {
    const existing: string = '# My own rules\n\nNever delete my notes.\n';

    const outcome: MergeOutcome = mergeContainer(request(existing));

    expect(outcome.kind).toBe('updated');
    const merged: string = contentOrThrow(outcome);
    expect(merged.startsWith(existing)).toBe(true);
    expect(merged).toContain(frameRegion(FRAMING));
  });

  it('replaces a pristine region in place, leaving the text around it untouched', () => {
    const existing: string = `above\n\n${frameRegion(FRAMING)}\nbelow\n`;
    const updated: RegionFraming = { ...FRAMING, content: 'newer omd rules\n' };

    const outcome: MergeOutcome = mergeContainer({
      existing,
      framing: updated,
    });

    expect(outcome.kind).toBe('updated');
    expect(contentOrThrow(outcome)).toBe(
      `above\n\n${frameRegion(updated)}\nbelow\n`,
    );
  });

  it('reports unchanged and returns no content when the region is identical', () => {
    const existing: string = `above\n\n${frameRegion(FRAMING)}\nbelow\n`;

    const outcome: MergeOutcome = mergeContainer(request(existing));

    expect(outcome).toEqual({ kind: 'unchanged' });
  });

  it('preserves a region the user has edited', () => {
    const existing: string = frameRegion(FRAMING).replace(
      'omd rules',
      'omd rules, tuned by me',
    );

    const outcome: MergeOutcome = mergeContainer(request(existing));

    expect(outcome.kind).toBe('preserved');
    expect(outcome.kind === 'preserved' && outcome.reason.length > 0).toBe(
      true,
    );
  });

  it('conflicts on a malformed region rather than guessing', () => {
    const existing: string = `${frameRegion(FRAMING)}${frameRegion(FRAMING)}`;

    const outcome: MergeOutcome = mergeContainer(request(existing));

    expect(outcome.kind).toBe('conflicted');
    expect(outcome.kind === 'conflicted' && outcome.reason.length > 0).toBe(
      true,
    );
  });
});
