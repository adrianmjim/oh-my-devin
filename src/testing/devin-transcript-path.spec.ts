import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { devinTranscriptPath } from './devin-transcript-path';

describe('devinTranscriptPath', () => {
  it('resolves the session transcript under the XDG data base', () => {
    expect(devinTranscriptPath('/data', '/home/user', 'mini-parrot')).toBe(
      join('/data', 'devin', 'cli', 'transcripts', 'mini-parrot.json'),
    );
  });

  it('falls back to the home data base when XDG is unset or relative', () => {
    const expected: string = join(
      '/home/user',
      '.local',
      'share',
      'devin',
      'cli',
      'transcripts',
      'mini-parrot.json',
    );

    expect(devinTranscriptPath(undefined, '/home/user', 'mini-parrot')).toBe(
      expected,
    );
    expect(devinTranscriptPath('relative', '/home/user', 'mini-parrot')).toBe(
      expected,
    );
  });
});
