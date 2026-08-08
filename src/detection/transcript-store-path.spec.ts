import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { transcriptStorePath } from './transcript-store-path';

describe('transcriptStorePath', () => {
  it('resolves the engine default under the home directory', () => {
    expect(transcriptStorePath({}, '/home/dev')).toBe(
      join('/home/dev', '.local', 'share', 'devin', 'cli', 'sessions.db'),
    );
  });

  it('honours the store location the engine exports', () => {
    expect(
      transcriptStorePath({ CHISEL_SESSION_DB: '/elsewhere/db' }, '/home/dev'),
    ).toBe('/elsewhere/db');
  });

  it('falls back to the default when the exported location is empty', () => {
    expect(transcriptStorePath({ CHISEL_SESSION_DB: '  ' }, '/home/dev')).toBe(
      join('/home/dev', '.local', 'share', 'devin', 'cli', 'sessions.db'),
    );
  });
});
